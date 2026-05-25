const express  = require("express");
const jwt      = require("jsonwebtoken");
const https    = require("https");
const { body, validationResult } = require("express-validator");
const { getUser, createUser } = require("../lib/getUser");

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5500";
const BACKEND_URL  = process.env.BACKEND_URL  || "http://localhost:5000";
const JWT_SECRET   = process.env.JWT_SECRET   || "mealfit_jwt_secret_key_2024";
const JWT_EXPIRE   = process.env.JWT_EXPIRE   || "7d";

const generateToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });

// HTTPS GET
const httpsGet = (url, headers = {}) =>
  new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "MealFit/1.0", ...headers } }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => { try { resolve(JSON.parse(d)); } catch { resolve(d); } });
    }).on("error", reject);
  });

// HTTPS POST (form-urlencoded)
const httpsPost = (url, body) =>
  new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const opts = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body),
        "User-Agent": "MealFit/1.0"
      }
    };
    const req = https.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => { try { resolve(JSON.parse(d)); } catch { resolve(d); } });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });

// =============================================
// 일반 회원가입 (아이디 + 비밀번호)
// =============================================
router.post("/signup", [
  body("id").isLength({ min: 4 }).withMessage("아이디는 4자 이상이어야 합니다."),
  body("password").isLength({ min: 4 }).withMessage("비밀번호는 4자 이상이어야 합니다.")
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg });

  const { id, password, passwordConfirm } = req.body;
  if (passwordConfirm && password !== passwordConfirm)
    return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });

  try {
    const User = getUser();
    const existing = await User.findOne({ id });
    if (existing) return res.status(400).json({ message: "이미 사용중인 아이디입니다." });

    const user = createUser({ id, password, loginType: "password" });
    await user.save();

    const token = generateToken(user._id.toString());
    res.status(201).json({ message: "회원가입 성공", token, user: user.toJSON() });
  } catch (err) {
    console.error("회원가입 에러:", err);
    res.status(500).json({ message: "서버 오류: " + err.message });
  }
});

// =============================================
// 일반 로그인
// =============================================
router.post("/login", async (req, res) => {
  const { id, password } = req.body;
  try {
    const User = getUser();
    // select("+password") 는 MongoDB에서만 필요 — 로컬DB는 항상 포함
    const user = typeof User.findOne === "function"
      ? await User.findOne({ id })
      : await User.findOne({ id });

    // MongoDB일 때 password 필드 다시 로드
    let userWithPw = user;
    if (user && user.constructor && user.constructor.modelName) {
      // Mongoose 모델인 경우 password select
      const MongoUser = require("../models/User");
      userWithPw = await MongoUser.findOne({ id }).select("+password");
    }

    if (!userWithPw) return res.status(400).json({ message: "가입되지 않은 아이디입니다." });
    if (userWithPw.loginType !== "password")
      return res.status(400).json({ message: `${userWithPw.loginType} 소셜 로그인을 이용해주세요.` });

    const isMatch = await userWithPw.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });

    userWithPw.lastLogin = new Date().toISOString();
    await userWithPw.save();

    const token = generateToken(userWithPw._id.toString());
    res.json({ message: "로그인 성공", token, user: userWithPw.toJSON() });
  } catch (err) {
    console.error("로그인 에러:", err);
    res.status(500).json({ message: "서버 오류: " + err.message });
  }
});

// =============================================
// 카카오 OAuth
// =============================================
router.get("/kakao", (req, res) => {
  const clientId = process.env.KAKAO_CLIENT_ID;
  if (!clientId)
    return res.redirect(`${FRONTEND_URL}/pages/login.html?error=${encodeURIComponent("카카오 CLIENT_ID 미설정")}`);
  const redirectUri = encodeURIComponent(`${BACKEND_URL}/api/auth/kakao/callback`);
  res.redirect(`https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&prompt=login`);
});

router.get("/kakao/callback", async (req, res) => {
  const { code, error } = req.query;
  if (error)
    return res.redirect(`${FRONTEND_URL}/pages/login.html?error=${encodeURIComponent(error)}`);
  try {
    const clientId     = process.env.KAKAO_CLIENT_ID;
    const clientSecret = process.env.KAKAO_CLIENT_SECRET || "";
    const redirectUri  = `${BACKEND_URL}/api/auth/kakao/callback`;

    const tokenData = await httpsPost(
      "https://kauth.kakao.com/oauth/token",
      `grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`
    );
    if (!tokenData.access_token) throw new Error("카카오 토큰 발급 실패: " + JSON.stringify(tokenData));

    const profile = await httpsGet("https://kapi.kakao.com/v2/user/me", {
      Authorization: `Bearer ${tokenData.access_token}`
    });

    const kakaoId  = String(profile.id);
    const nickname = profile.kakao_account?.profile?.nickname || `카카오사용자${kakaoId.slice(-4)}`;

    const User = getUser();
    let user = await User.findOne({ "social.kakao.id": kakaoId });
    if (!user) {
      user = createUser({
        id: `kakao_${kakaoId}`,
        name: nickname,
        loginType: "kakao",
        social: { kakao: { id: kakaoId, linkedAt: new Date().toISOString() } }
      });
      await user.save();
    }

    const token = generateToken(user._id.toString());
    res.redirect(`${FRONTEND_URL}/pages/login.html?token=${token}`);
  } catch (err) {
    console.error("카카오 OAuth 에러:", err);
    res.redirect(`${FRONTEND_URL}/pages/login.html?error=${encodeURIComponent("카카오 로그인 오류: " + err.message)}`);
  }
});

// =============================================
// 네이버 OAuth
// =============================================
router.get("/naver", (req, res) => {
  const clientId = process.env.NAVER_CLIENT_ID;
  if (!clientId)
    return res.redirect(`${FRONTEND_URL}/pages/login.html?error=${encodeURIComponent("네이버 CLIENT_ID 미설정")}`);
  const state       = Math.random().toString(36).slice(2);
  const redirectUri = encodeURIComponent(`${BACKEND_URL}/api/auth/naver/callback`);
  res.redirect(`https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&auth_type=reprompt`);
});

router.get("/naver/callback", async (req, res) => {
  const { code, state, error } = req.query;
  if (error)
    return res.redirect(`${FRONTEND_URL}/pages/login.html?error=${encodeURIComponent(error)}`);
  try {
    const clientId     = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;
    const redirectUri  = `${BACKEND_URL}/api/auth/naver/callback`;

    const tokenData = await httpsPost(
      "https://nid.naver.com/oauth2.0/token",
      `grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}&state=${state}`
    );
    if (!tokenData.access_token) throw new Error("네이버 토큰 발급 실패: " + JSON.stringify(tokenData));

    const profileData = await httpsGet("https://openapi.naver.com/v1/nid/me", {
      Authorization: `Bearer ${tokenData.access_token}`
    });
    const profile  = profileData.response;
    const naverId  = String(profile.id);
    const nickname = profile.name || profile.nickname || `네이버사용자${naverId.slice(-4)}`;

    const User = getUser();
    let user = await User.findOne({ "social.naver.id": naverId });
    if (!user) {
      user = createUser({
        id: `naver_${naverId}`,
        name: nickname,
        email: profile.email || null,
        loginType: "naver",
        social: { naver: { id: naverId, linkedAt: new Date().toISOString() } }
      });
      await user.save();
    }

    const token = generateToken(user._id.toString());
    res.redirect(`${FRONTEND_URL}/pages/login.html?token=${token}`);
  } catch (err) {
    console.error("네이버 OAuth 에러:", err);
    res.redirect(`${FRONTEND_URL}/pages/login.html?error=${encodeURIComponent("네이버 로그인 오류: " + err.message)}`);
  }
});

// =============================================
// 구글 OAuth
// =============================================
router.get("/google", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId)
    return res.redirect(`${FRONTEND_URL}/pages/login.html?error=${encodeURIComponent("구글 CLIENT_ID 미설정")}`);
  const redirectUri = encodeURIComponent(`${BACKEND_URL}/api/auth/google/callback`);
  const scope       = encodeURIComponent("openid email profile");
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&prompt=select_account&access_type=online`);
});

router.get("/google/callback", async (req, res) => {
  const { code, error } = req.query;
  if (error)
    return res.redirect(`${FRONTEND_URL}/pages/login.html?error=${encodeURIComponent(error)}`);
  try {
    const clientId     = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri  = `${BACKEND_URL}/api/auth/google/callback`;

    const tokenData = await httpsPost(
      "https://oauth2.googleapis.com/token",
      `code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&grant_type=authorization_code`
    );
    if (!tokenData.access_token) throw new Error("구글 토큰 발급 실패: " + JSON.stringify(tokenData));

    const profile  = await httpsGet("https://www.googleapis.com/oauth2/v2/userinfo", {
      Authorization: `Bearer ${tokenData.access_token}`
    });
    const googleId = String(profile.id);
    const nickname = profile.name || `구글사용자${googleId.slice(-4)}`;

    const User = getUser();
    let user = await User.findOne({ "social.google.id": googleId });
    if (!user) {
      user = createUser({
        id: `google_${googleId}`,
        name: nickname,
        email: profile.email || null,
        loginType: "google",
        social: { google: { id: googleId, linkedAt: new Date().toISOString() } }
      });
      await user.save();
    }

    const token = generateToken(user._id.toString());
    res.redirect(`${FRONTEND_URL}/pages/login.html?token=${token}`);
  } catch (err) {
    console.error("구글 OAuth 에러:", err);
    res.redirect(`${FRONTEND_URL}/pages/login.html?error=${encodeURIComponent("구글 로그인 오류: " + err.message)}`);
  }
});

module.exports = router;
