//check Login
const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

//check usernameซ้ำมั้ย
checkDuplicateUsername = async (req, res, next) => {
  try {
    //ใช้findOne หาwhere username
    let user = await User.findOne({ where: { username: req.body.username } })
    if (user) {
      res.status(400).send(new ErrorRes("Failed! Username is already in use!", 400))
      return;
    }
    next();
  }
  catch (error) {
    res.status(500).send(new ErrorCatchRes(error))
  }
}

//ตรวจสอบบทบาทที่มีอยู่
checkRolesExisted = (req, res, next) => {
  if (req.body.role_name) {
    for (let i = 0; i < req.body.role_name.length; i++) {
      //ถ้าไม่เจอค่าใน ROLE
      if (!ROLES.includes(req.body.role_name[i])) {
        res.status(400).send(new ErrorRes("Please select role.", 400))
        return;
      }
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateUsername: checkDuplicateUsername,
  checkRolesExisted: checkRolesExisted
};

module.exports = verifySignUp;
