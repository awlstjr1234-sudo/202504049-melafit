const express = require("express");
const https = require("https");

const router = express.Router();

// Gemini API 호출
const callGemini = (apiKey, prompt) =>
  new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    });

    const opts = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      }
    };

    const req = https.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        try {
          const json = JSON.parse(d);
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) resolve(text);
          else reject(new Error(json.error?.message || JSON.stringify(json)));
        } catch { reject(new Error(d)); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });

router.post("/chat", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt)
    return res.status(400).json({ success: false, message: "프롬프트를 입력해주세요." });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return res.status(503).json({
      success: false,
      message: "Gemini API 키가 설정되지 않았습니다. backend/.env 파일에 GEMINI_API_KEY를 입력해주세요.\n\n발급 방법: https://aistudio.google.com 에서 무료 API 키 발급 가능"
    });
  }

  try {
    const text = await callGemini(apiKey, prompt);
    res.json({ success: true, text });
  } catch (err) {
    console.error("Gemini 오류:", err.message);
    res.status(500).json({ success: false, message: "AI 응답 생성 실패: " + err.message });
  }
});

module.exports = router;
