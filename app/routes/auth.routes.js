//ใช้ signup signin เช็คrefreshToken
const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
const user = require("../controllers/user.controller.js");
const role = require("../controllers/role.controller.js");


module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsername,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );

  app.post("/api/auth/signin", controller.signin);

  app.post("/api/auth/signout", controller.signout);

  app.post("/api/auth/refreshtoken", controller.refreshToken);

  app.get("/api/all/users", user.findAllUser)

   app.get("/api/all/roles", role.AllRole)

  app.delete("/api/deleteAll/users", user.deleteAllUser)

};

