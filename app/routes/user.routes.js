const { authJwt } = require("../middleware/index.js");
const controller = require("../controllers/user.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // app.get("/api/test/all", controller.allAccess);

    //check role ของตัวเองผ่าน token
    app.get(
        "/api/test/user",
        [authJwt.verifyToken],
        controller.userBoard
    );

    app.get(
        "/api/test/student",
        [authJwt.verifyToken, authJwt.isStudent],
        controller.studentBoard
    );

    app.get(
        "/api/test/admin",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.adminBoard
    );

    app.get(
        "/api/test/teacher",
        [authJwt.verifyToken, authJwt.isTeacher],
        controller.teacherBoard
    );

    


};