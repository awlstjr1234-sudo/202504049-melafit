const express = require("express");
const https = require("https");
const router = express.Router();

const naverAPI = (path, clientId, clientSecret) =>
  new Promise((resolve, reject) => {
    const opts = {
      hostname: "openapi.naver.com",
      path,
      method: "GET",
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
        "User-Agent": "MealFit/1.0"
      }
    };
    const req = https.request(opts, (res) => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => { try { resolve(JSON.parse(d)); } catch { reject(new Error(d)); } });
    });
    req.on("error", reject);
    req.end();
  });

// 네이버 블로그 레시피 검색
router.get("/recipes", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, message: "검색어를 입력해주세요." });

  const clientId     = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret)
    return res.status(503).json({ success: false, message: "네이버 검색 API 미설정" });

  try {
    const query = encodeURIComponent(`${q} 레시피`);
    const data  = await naverAPI(`/v1/search/blog?query=${query}&display=10&sort=sim`, clientId, clientSecret);
    if (!data.items) throw new Error(data.errorMessage || JSON.stringify(data));

    const items = data.items.map(item => ({
      title:       item.title.replace(/<[^>]*>/g, ""),
      description: item.description.replace(/<[^>]*>/g, "").slice(0, 150) + "...",
      link:        item.link,
      bloggerName: item.bloggername,
      date:        (item.postdate || "").replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2.$3")
    }));

    res.json({ success: true, items });
  } catch (err) {
    console.error("레시피 검색 오류:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 네이버 이미지 검색 → 첫 번째 이미지로 리다이렉트
router.get("/image", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).send("Query required");

  const clientId     = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.redirect(`https://placehold.co/300x200/e8f0e0/4a6741?text=${encodeURIComponent(q)}`);
  }

  try {
    const query = encodeURIComponent(`${q} 한국음식`);
    const data  = await naverAPI(`/v1/search/image?query=${query}&display=1&sort=sim&filter=all`, clientId, clientSecret);
    if (data.items && data.items.length > 0) {
      res.redirect(data.items[0].thumbnail);
    } else {
      res.redirect(`https://placehold.co/300x200/e8f0e0/4a6741?text=${encodeURIComponent(q)}`);
    }
  } catch {
    res.redirect(`https://placehold.co/300x200/e8f0e0/4a6741?text=${encodeURIComponent(q)}`);
  }
});

module.exports = router;
