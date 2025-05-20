const { authJwt } = require("../middleware/index.js");
const student = require("../controllers/student.controller.js");
const subject = require("../controllers/subject.controller.js");
const file = require("../controllers/file.controller");
const controller = require("../controllers/user.controller.js");
const teacher = require("../controllers/teacher.controller.js");
const auth = require("../controllers/auth.controller.js");
const user = require("../controllers/user.controller.js");
const semester = require("../controllers/semester.controller.js");
const question = require("../controllers/question.controller.js");
const evaluation = require("../controllers/evaluation.controller.js");
const evaluationDetail = require("../controllers/evaluationDetail.controller.js");
const teacherRating = require("../controllers/teacherRating.controller.js");
const gradeDetail = require("../controllers/gradeDetail.controller.js");
const gradeTerm = require("../controllers/gradeTerm.controller.js");
const chatHistory = require("../controllers/chatHistory.controller.js");

module.exports = function (app) {
    //-----------------------------------------------------Student-------------------------------------------------------------------------------------//
    app.post("/student/create", [authJwt.verifyToken, authJwt.isStudent],
        student.createStudent);

    app.get("/student/find/:id", [authJwt.verifyToken, authJwt.isStudent],
        student.findStudentByStudentId);

    app.get("/student/find/byuser/:user_id", [authJwt.verifyToken, authJwt.isStudent],
        student.findStudentByUserId);

    app.get("/student/gpa/:id", [authJwt.verifyToken, authJwt.isStudent],
        student.findGpaStudent)

    app.delete("/student/delete/subject/:student_id/:subject_id", [authJwt.verifyToken, authJwt.isStudent],
        student.removeSubjectByStudent)

    app.put("/student/update", [authJwt.verifyToken, authJwt.isStudent],
        student.changeStudentName);

    app.get("/student/studentSubject/:student_id/:subject_id", [authJwt.verifyToken, authJwt.isStudent],
        student.checkIsStudentAddThisSubject)

    app.post("/student/upload", [authJwt.verifyToken, authJwt.isStudent],
        file.upload)

    app.post("/student/find/files", [authJwt.verifyToken, authJwt.isStudent],
        file.findImage)

    app.post("/student/find/multi/files", [authJwt.verifyToken, authJwt.isStudent],
        file.findMultiImage)

    app.get("/student/files", [authJwt.verifyToken, authJwt.isStudent],
        file.getListFiles)
    // app.get("/files/:name", file.download);

    //................Student-Subject...................
    app.get("/student/all/teacher", [authJwt.verifyToken, authJwt.isStudent],
        teacher.findAllTeacher);

    app.get("/student/find/subject/:id", [authJwt.verifyToken, authJwt.isStudent],
        subject.findSubjectById);

    app.post("/student/find/multi/subject", [authJwt.verifyToken, authJwt.isStudent],
        subject.findMultiSubject);

    //................Student-Subject...................
    app.post("/student/add/subject/:student_id/:subject_id", [authJwt.verifyToken, authJwt.isStudent],
        student.addSubjectByStudent)

    app.get("/student/find/subject/:id", [authJwt.verifyToken, authJwt.isStudent],
        subject.findSubjectById);
    //................Student-Semester...................
    app.get("/student/check/semester", [authJwt.verifyToken, authJwt.isStudent],
        semester.checkSemester);
    //................Student-Question...................
    app.get("/student/all/question", [authJwt.verifyToken, authJwt.isStudent],
        question.findAllQuestion);

    app.post("/student/create/single/question", [authJwt.verifyToken, authJwt.isStudent],
        question.createSingleQuestion);

    app.post("/student/create/multi/question", [authJwt.verifyToken, authJwt.isStudent],
        question.createMultiQuestion);

    app.post("/student/random/question", [authJwt.verifyToken, authJwt.isStudent],
        question.randomQuestion);

    //................Admin-EvaluationDetail...................\
    app.post("/student/create/single/evaluationDetail", [authJwt.verifyToken, authJwt.isStudent],
        evaluationDetail.createEvaluationDetail);

    app.post("/student/create/multi/evaluationDetail", [authJwt.verifyToken, authJwt.isStudent],
        evaluationDetail.createMultiEvaluationDetail);

    app.get("/student/all/evaluationDetail", [authJwt.verifyToken, authJwt.isStudent],
        evaluationDetail.findAllEnvaluationDetail);

    app.post("/student/find/evaluationDetail", [authJwt.verifyToken, authJwt.isStudent],
        evaluationDetail.findEnvaluationDetailById);

    app.delete("/student/delete/evaluationDetail", [authJwt.verifyToken, authJwt.isStudent],
        evaluationDetail.deleteEvaluationDetail);

    app.delete("/student/delete/all/evaluationDetail", [authJwt.verifyToken, authJwt.isStudent],
        evaluationDetail.deleteAllEvaluationDetail);

    //................Student-Chat...................
    app.post("/user/all/chat", [authJwt.verifyToken, authJwt.isUser],
        chatHistory.findChatHistory);
};