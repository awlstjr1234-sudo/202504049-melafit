const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/mealfit";

  try {
    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log("✅ MongoDB 연결 성공:", mongoUri);
  } catch (error) {
    console.warn("⚠️  MongoDB 연결 실패 — 로컬 JSON 파일 저장소로 대체합니다.");
    console.warn("   원인:", error.message);
    console.warn("   MongoDB Atlas 설정 방법: backend/.env 의 MONGODB_URI를 Atlas 주소로 변경하세요.");
    isConnected = false;
    // 서버를 종료하지 않고 계속 실행
  }
};

const getIsConnected = () => isConnected;

module.exports = connectDB;
module.exports.getIsConnected = getIsConnected;
