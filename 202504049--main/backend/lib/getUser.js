// MongoDB 연결 여부에 따라 User 모델 자동 전환
const { getIsConnected } = require("../config/db");

let _mongoUser = null;
let _localUser = null;

function getUser() {
  if (getIsConnected()) {
    if (!_mongoUser) _mongoUser = require("../models/User");
    return _mongoUser;
  }
  if (!_localUser) _localUser = require("./localDb").LocalUserModel;
  return _localUser;
}

// new User({...}) 패턴을 지원하는 래퍼
function createUser(data) {
  if (getIsConnected()) {
    const MongoUser = getUser();
    return new MongoUser(data);
  }
  const { LocalUser } = require("./localDb");
  return new LocalUser(data);
}

module.exports = { getUser, createUser };
