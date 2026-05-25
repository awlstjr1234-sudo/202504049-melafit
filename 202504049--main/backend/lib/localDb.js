// JSON 파일 기반 로컬 저장소 (MongoDB 없이도 동작)
const fs   = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const DATA_DIR  = path.join(__dirname, "..", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// data 폴더 없으면 생성
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]", "utf8");

const readUsers = () => {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, "utf8")); }
  catch { return []; }
};
const writeUsers = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");

// Mongoose 스타일 User 클래스 (호환 인터페이스)
class LocalUser {
  constructor(data) {
    this._id    = data._id || `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.id     = data.id;
    this.email  = data.email || null;
    this.password = data.password || null;
    this.name   = data.name || null;
    this.loginType = data.loginType || "password";
    this.social = data.social || {};
    this.settings = data.settings || { monthlyBudget: 150000 };
    this.ingredients = data.ingredients || [];
    this.shopping = data.shopping || [];
    this.lastLogin = data.lastLogin || new Date().toISOString();
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  async save() {
    // 비밀번호 해시 (아직 안 된 경우)
    if (this.password && !this.password.startsWith("$2")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    const users = readUsers();
    const idx = users.findIndex((u) => u._id === this._id);
    if (idx >= 0) users[idx] = this._toRaw();
    else users.push(this._toRaw());
    writeUsers(users);
    return this;
  }

  async comparePassword(candidate) {
    if (!this.password) return false;
    return bcrypt.compare(candidate, this.password);
  }

  toJSON() {
    const obj = { ...this._toRaw() };
    delete obj.password;
    return obj;
  }

  _toRaw() {
    return {
      _id: this._id, id: this.id, email: this.email,
      password: this.password, name: this.name,
      loginType: this.loginType, social: this.social,
      settings: this.settings, ingredients: this.ingredients,
      shopping: this.shopping, lastLogin: this.lastLogin,
      createdAt: this.createdAt
    };
  }
}

// Mongoose 쿼리 호환 함수들
const LocalUserModel = {
  async findOne(query) {
    const users = readUsers();
    const user  = users.find((u) => matchQuery(u, query));
    return user ? new LocalUser(user) : null;
  },

  async findById(id) {
    const users = readUsers();
    const user  = users.find((u) => u._id === id);
    return user ? new LocalUser(user) : null;
  },

  async find(query = {}) {
    const users = readUsers();
    return users.filter((u) => matchQuery(u, query)).map((u) => new LocalUser(u));
  },

  // new LocalUserModel({...}) 호환
  create(data) {
    return new LocalUser(data);
  }
};

// 간단한 쿼리 매칭
function matchQuery(user, query) {
  if (!query || Object.keys(query).length === 0) return true;

  for (const [key, val] of Object.entries(query)) {
    if (key === "$or") {
      if (!val.some((sub) => matchQuery(user, sub))) return false;
      continue;
    }
    // 중첩 키 (예: "social.kakao.id")
    if (key.includes(".")) {
      const parts = key.split(".");
      let cur = user;
      for (const p of parts) cur = cur?.[p];
      if (cur !== val) return false;
      continue;
    }
    if (user[key] !== val) return false;
  }
  return true;
}

module.exports = { LocalUser, LocalUserModel };
