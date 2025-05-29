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
      res.status(400).send({
        message: "Failed! Username is already in use!",
        data: null,
        status_code: 400
      });
      return;
    }
    next();
  }
  catch (err) {
    res.status(500).send({
      message: "ERROR : " + err.message,
      data: null,
      status_code: 500
    })
  }
}

//ตรวจสอบบทบาทที่มีอยู่
checkRolesExisted = (req, res, next) => {
  if (req.body.role_name) {
    for (let i = 0; i < req.body.role_name.length; i++) {
      //ถ้าไม่เจอค่าใน ROLE
      if (!ROLES.includes(req.body.role_name[i])) {
        res.status(400).send({
          message: "Please select role.",
          // message: "Failed! Role does not exist = " + req.body.role_name[i],
          data: null,
          status_code: 400
        });
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
                                                                                                                                                                                                                