const { authJwt } = require("../middleware/index.js");
const teacher = require("../controllers/teacher.controller.js");
const subject = require("../controllers/subject.controller.js");
const file = require("../controllers/file.controller.js");
const gradeDetail = require("../controllers/gradeDetail.controller.js");
const semester = require("../controllers/semester.controller.js");
const chatHistory = require("../controllers/chatHistory.controller.js");

module.exports = function (app) {
    //-----------------------------------------------------Teacher-------------------------------------------------------------------------------------//
    app.post("/teacher/create", [authJwt.verifyToken, authJwt.isTeacher],
        teacher.createTeacher);

    app.get("/teacher/find/:id", [authJwt.verifyToken, authJwt.isTeacher],
        teacher.findTeacherByTeacherId);

    app.get("/teacher/find/byuser/:user_id", [authJwt.verifyToken, authJwt.isTeacher],
        teacher.findTeacherByUserId);

    app.get("/teacher/all/teacher", [authJwt.verifyToken, authJwt.isTeacher],
        teacher.findAllTeacher);

    //................Teacher-Subject...................
    app.get("/teacher/find/subject/:id", [authJwt.verifyToken, authJwt.isTeacher],
        subject.findSubjectById);

    app.post("/teacher/find/multi/subject", [authJwt.verifyToken, authJwt.isTeacher],
        subject.findMultiSubject);

    app.post("/teacher/check/subject/:teacher_id/:subject_id", [authJwt.verifyToken, authJwt.isTeacher],
        teacher.checkIsTeacherAddThisSubject);

    app.post("/teacher/add/subject", [authJwt.verifyToken, authJwt.isTeacher],
        teacher.addTeachSubject);

    app.delete("/teacher/remove/subject/:teacher_id/:subject_id", [authJwt.verifyToken, authJwt.isTeacher],
        teacher.removeSubjectByTeacher);

    app.post("/teacher/upload", [authJwt.verifyToken, authJwt.isTeacher],
        file.upload)

    app.post("/teacher/find/multi/files", [authJwt.verifyToken, authJwt.isTeacher],
        file.findMultiImage)

    app.post("/teacher/find/files", [authJwt.verifyToken, authJwt.isTeacher],
        file.findImage)

    //................Teacher-Semester...................
    app.get("/teacher/check/semester", [authJwt.verifyToken, authJwt.isTeacher],
        semester.checkSemester);

    //................Teacher-GradeDetail...................
    app.post("/teacher/create/gradeDetail", [authJwt.verifyToken, authJwt.isTeacher],
        gradeDetail.createGradeDetail);

    app.post("/teacher/create/multi/gradeDetail", [authJwt.verifyToken, authJwt.isTeacher],
        gradeDetail.createUpdateMultiGradeDetail);

    app.get("/teacher/all/gradeDetail", [authJwt.verifyToken, authJwt.isTeacher],
        gradeDetail.findAllGradeDetail);

    app.put("/teacher/update/gradeDetail", [authJwt.verifyToken, authJwt.isTeacher],
        gradeDetail.updateGradeDetail);

    app.delete("/teacher/delete/all/gradeDetail", [authJwt.verifyToken, authJwt.isTeacher],
        gradeDetail.deleteAllGradeDetail);

    //................Student-Chat...................
    app.post("/teacher/all/chat", [authJwt.verifyToken, authJwt.isTeacher],
        chatHistory.findChatHistory);
};