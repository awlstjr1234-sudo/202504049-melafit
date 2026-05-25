const express = require("express");
const { getUser } = require("../lib/getUser");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await getUser().findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }
    return res.status(200).json({ success: true, user: user.toJSON() });
  } catch (error) {
    console.error("사용자 조회 오류:", error);
    return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

router.post("/unlink-social/:provider", authMiddleware, async (req, res) => {
  try {
    const provider = req.params.provider;
    if (!["kakao", "naver", "google"].includes(provider)) {
      return res.status(400).json({ success: false, message: "지원되지 않는 소셜 제공업체입니다." });
    }

    const user = await getUser().findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }

    if (user.social && user.social[provider]) {
      user.social[provider] = undefined;
      await user.save();
    }

    return res.status(200).json({ success: true, message: `${provider} 연동이 해제되었습니다.`, user: user.toJSON() });
  } catch (error) {
    console.error("소셜 연동 해제 오류:", error);
    return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

router.patch("/me", authMiddleware, async (req, res) => {
  try {
    const { name, avatar, monthlyBudget, preferredCategories, preferredDietary } = req.body;
    const user = await getUser().findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }

    if (name !== undefined) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (monthlyBudget !== undefined) user.settings.monthlyBudget = monthlyBudget;
    if (preferredCategories) user.settings.preferredCategories = preferredCategories;
    if (preferredDietary) user.settings.preferredDietary = preferredDietary;
    const { bio, gender } = req.body;
    if (bio !== undefined) user.bio = bio;
    if (gender !== undefined) user.gender = gender;

    await user.save();
    return res.status(200).json({ success: true, message: "사용자 정보가 업데이트되었습니다.", user: user.toJSON() });
  } catch (error) {
    console.error("사용자 업데이트 오류:", error);
    return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// 비밀번호 변경
router.patch("/me/password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ success: false, message: "현재 비밀번호와 새 비밀번호를 모두 입력해주세요." });
  if (newPassword.length < 4)
    return res.status(400).json({ success: false, message: "새 비밀번호는 4자 이상이어야 합니다." });
  try {
    let user = await getUser().findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    if (user.loginType !== "password")
      return res.status(400).json({ success: false, message: "소셜 로그인 계정은 비밀번호를 변경할 수 없습니다." });
    // MongoDB는 select("+password") 필요
    if (user.constructor && user.constructor.modelName) {
      const MongoUser = require("../models/User");
      user = await MongoUser.findById(req.userId).select("+password");
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: "현재 비밀번호가 일치하지 않습니다." });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "비밀번호가 변경되었습니다." });
  } catch (err) {
    console.error("비밀번호 변경 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류: " + err.message });
  }
});

router.get("/ingredients", authMiddleware, async (req, res) => {
  try {
    const user = await getUser().findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }
    return res.status(200).json({ success: true, ingredients: user.ingredients || [] });
  } catch (error) {
    console.error("재료 목록 조회 오류:", error);
    return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

router.post("/ingredients", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "재료명은 필수입니다." });
    }
    const user = await getUser().findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }
    user.ingredients = user.ingredients || [];
    user.ingredients.unshift({ name, addedAt: new Date() });
    await user.save();
    return res.status(201).json({ success: true, message: "재료가 추가되었습니다.", ingredients: user.ingredients });
  } catch (error) {
    console.error("재료 추가 오류:", error);
    return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

router.get("/shopping", authMiddleware, async (req, res) => {
  try {
    const user = await getUser().findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }
    return res.status(200).json({ success: true, shopping: user.shopping || [] });
  } catch (error) {
    console.error("장보기 목록 조회 오류:", error);
    return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

router.post("/shopping", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "장보기 항목 이름은 필수입니다." });
    }
    const user = await getUser().findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }
    user.shopping = user.shopping || [];
    user.shopping.unshift({ name, addedAt: new Date() });
    await user.save();
    return res.status(201).json({ success: true, message: "장보기 항목이 추가되었습니다.", shopping: user.shopping });
  } catch (error) {
    console.error("장보기 추가 오류:", error);
    return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
