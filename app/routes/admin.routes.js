const { authJwt } = require("../middleware/index.js");
const controller = require("../controllers/user.controller.js");
const student = require("../controllers/student.controller.js");
const subject = require("../controllers/subject.controller.js");
const teacher = require("../controllers/teacher.controller.js");
const auth = require("../controllers/auth.controller.js");
const user = require("../controllers/user.controller.js");
const role = require("../controllers/role.controller.js");
const semester = require("../controllers/semester.controller.js");
const question = require("../controllers/question.controller.js");
const evaluation = require("../controllers/evaluation.controller.js");
const evaluationDetail = require("../controllers/evaluationDetail.controller.js");
const teacherRating = require("../controllers/teacherRating.controller.js");
const gradeDetail = require("../controllers/gradeDetail.controller.js");
const gradeTerm = require("../controllers/gradeTerm.controller.js");
const chatHistory = require("../controllers/chatHistory.controller.js");


module.exports = function (app) {
    //-----------------------------------------------------Admin-------------------------------------------------------------------------------------//
    //................Admin-User...................
    app.post("/admin/create/user", [authJwt.verifyToken, authJwt.isAdmin],
        auth.signup);

    app.post("/admin/find/user/id", [authJwt.verifyToken, authJwt.isAdmin],
        user.findByUserId);

    app.get("/admin/all/user", [authJwt.verifyToken, authJwt.isAdmin],
        user.findAllUser);

    app.put("/admin/update/user", [authJwt.verifyToken, authJwt.isAdmin],
        user.changePassword);

    app.delete("/admin/delete/user", [authJwt.verifyToken, authJwt.isAdmin],
        user.deleteUser);

    app.delete("/admin/deleteAll/user", [authJwt.verifyToken, authJwt.isAdmin],
        user.deleteAllUser);

    app.post("/admin/search/user", [authJwt.verifyToken, authJwt.isAdmin],
        user.searchUser);
    //................Admin-Role...................
    app.post("/admin/create/role", [authJwt.verifyToken, authJwt.isAdmin],
        role.createRole);

    //................Admin-Student...................
    app.post("/admin/create/student", [authJwt.verifyToken, authJwt.isAdmin],
        student.createStudent);

    app.get("/admin/find/student/:id", [authJwt.verifyToken, authJwt.isAdmin],
        student.findStudentByStudentId);

    app.get("/admin/find/student/byuser/:user_id", [authJwt.verifyToken, authJwt.isAdmin],
        student.findStudentByUserId);

    app.get("/admin/all/student", [authJwt.verifyToken, authJwt.isAdmin],
        student.findAll)

    app.get("/admin/gpa/student/:id", [authJwt.verifyToken, authJwt.isAdmin],
        student.findGpaStudent)

    app.put("/admin/update/student", [authJwt.verifyToken, authJwt.isAdmin],
        student.changeStudentName);

    app.delete("/admin/delete/student/:id", [authJwt.verifyToken, authJwt.isAdmin],
        student.deleteStudentById);

    app.get("/admin/studentSubject/:student_id/:subject_id", [authJwt.verifyToken, authJwt.isAdmin],
        student.checkIsStudentAddThisSubject)

    app.post("/admin/search/student", [authJwt.verifyToken, authJwt.isAdmin],
        student.searchStudent);

    //................Admin-Subject...................
    app.post("/admin/create/subject", [authJwt.verifyToken, authJwt.isAdmin],
        subject.createSubject);

    app.get("/admin/find/subject/:id", [authJwt.verifyToken, authJwt.isAdmin],
        subject.findSubjectById);

    app.delete("/admin/delete/subject/:id", [authJwt.verifyToken, authJwt.isAdmin],
        subject.deleteSubject);

    app.put("/admin/update/subject/:id", [authJwt.verifyToken, authJwt.isAdmin],
        subject.editSubject);

    app.get("/admin/all/subject", [authJwt.verifyToken, authJwt.isAdmin],
        subject.findAllSubject);

    app.get("/admin/find/subject/:id", [authJwt.verifyToken, authJwt.isAdmin],
        subject.findSubjectById);

    app.post("/student/find/multi/subject", [authJwt.verifyToken, authJwt.isStudent],
        subject.findMultiSubject);

    app.delete("/admin/deleteAll/subject", [authJwt.verifyToken, authJwt.isAdmin],
        subject.deleteAllSubject);

    app.post("/admin/search/subject", [authJwt.verifyToken, authJwt.isAdmin],
        subject.searchSubject);

    //................Admin-Teacher...................
    app.post("/admin/create/teacher", [authJwt.verifyToken, authJwt.isAdmin],
        teacher.createTeacher);

    app.get("/admin/all/teacher", [authJwt.verifyToken, authJwt.isAdmin],
        teacher.findAllTeacher);

    app.get("/admin/find/teacher/:id", [authJwt.verifyToken, authJwt.isAdmin],
        teacher.findTeacherByTeacherId);

    app.delete("/admin/delete/teacher/:id", [authJwt.verifyToken, authJwt.isAdmin],
        teacher.deleteTeacherById);

    app.put("/admin/update/teacher", [authJwt.verifyToken, authJwt.isAdmin],
        teacher.changeTeacherName);

    app.post("/admin/search/teacher", [authJwt.verifyToken, authJwt.isAdmin],
        teacher.searchTeacher);

    //................Admin-GradeTerm...................
    app.get("/admin/all/gradeTerm", [authJwt.verifyToken, authJwt.isAdmin],
        gradeTerm.findAllGradeTerm);

    app.delete("/admin/delete/all/gradeTerm", [authJwt.verifyToken, authJwt.isAdmin],
        gradeTerm.deleteAllGradeTerm);

    //................Admin-GradeDetail...................
    app.post("/admin/create/gradeDetail", [authJwt.verifyToken, authJwt.isAdmin],
        gradeDetail.createGradeDetail);

    app.post("/admin/create/multi/gradeDetail", [authJwt.verifyToken, authJwt.isAdmin],
        gradeDetail.createUpdateMultiGradeDetail);


    app.get("/admin/all/gradeDetail", [authJwt.verifyToken, authJwt.isAdmin],
        gradeDetail.findAllGradeDetail);

    app.put("/admin/update/gradeDetail", [authJwt.verifyToken, authJwt.isAdmin],
        gradeDetail.updateGradeDetail);

    app.delete("/admin/delete/all/gradeDetail", [authJwt.verifyToken, authJwt.isAdmin],
        gradeDetail.deleteAllGradeDetail);

    app.delete("/admin/delete/gradeDetail", [authJwt.verifyToken, authJwt.isAdmin],
        gradeDetail.deleteGradeDetailById);

    //................Admin-semester...................
    app.post("/admin/create/semester", [authJwt.verifyToken, authJwt.isAdmin],
        semester.createSemester);

    app.get("/admin/all/semester/", [authJwt.verifyToken, authJwt.isAdmin],
        semester.findAllSemester);

    app.post("/admin/find/semester", [authJwt.verifyToken, authJwt.isAdmin],
        semester.findSemesterById);

    app.get("/admin/check/semester", [authJwt.verifyToken, authJwt.isAdmin],
        semester.checkSemester);

    app.delete("/admin/delete/semester", [authJwt.verifyToken, authJwt.isAdmin],
        semester.deleteSemester);

    app.put("/admin/update/semester", [authJwt.verifyToken, authJwt.isAdmin],
        semester.updateSemester);

    app.post("/admin/search/semester", [authJwt.verifyToken, authJwt.isAdmin],
        semester.searchSemester);

    //................Admin-Question...................
    app.get("/admin/all/question", [authJwt.verifyToken, authJwt.isAdmin],
        question.findAllQuestion);

    app.post("/admin/create/single/question", [authJwt.verifyToken, authJwt.isAdmin],
        question.createSingleQuestion);

    app.post("/admin/create/multi/question", [authJwt.verifyToken, authJwt.isAdmin],
        question.createMultiQuestion);

    //................Admin-Evaluation...................\
    app.post("/admin/create/evaluation", [authJwt.verifyToken, authJwt.isAdmin],
        evaluation.createEnvaluation);

    app.get("/admin/all/evaluation", [authJwt.verifyToken, authJwt.isAdmin],
        evaluation.findAllEnvaluation);

    app.post("/admin/find/evaluation", [authJwt.verifyToken, authJwt.isAdmin],
        evaluation.findEnvaluationById);

    app.delete("/admin/delete/all/evaluation", [authJwt.verifyToken, authJwt.isAdmin],
        evaluation.deleteAllEvaluation);

    app.delete("/admin/delete/evaluation", [authJwt.verifyToken, authJwt.isAdmin],
        evaluation.deleteEvaluation);

    //................Admin-EvaluationDetail...................\
    app.post("/admin/create/single/evaluationDetail", [authJwt.verifyToken, authJwt.isAdmin],
        evaluationDetail.createEvaluationDetail);

    app.post("/admin/create/multi/evaluationDetail", [authJwt.verifyToken, authJwt.isAdmin],
        evaluationDetail.createMultiEvaluationDetail);

    app.get("/admin/all/evaluationDetail", [authJwt.verifyToken, authJwt.isAdmin],
        evaluationDetail.findAllEnvaluationDetail);

    app.post("/admin/find/evaluationDetail", [authJwt.verifyToken, authJwt.isAdmin],
        evaluationDetail.findEnvaluationDetailById);

    app.post("/admin/check/evaluationDetail", [authJwt.verifyToken, authJwt.isAdmin],
        evaluationDetail.checkAlreadyAnswer);

    app.delete("/admin/delete/all/evaluationDetail", [authJwt.verifyToken, authJwt.isAdmin],
        evaluationDetail.deleteAllEvaluationDetail);

    app.delete("/admin/delete/evaluationDetail", [authJwt.verifyToken, authJwt.isAdmin],
        evaluationDetail.deleteEvaluationDetail);

    app.delete("/admin/delete/all/evaluationDetail", [authJwt.verifyToken, authJwt.isAdmin],
        evaluationDetail.deleteAllEvaluationDetail);

    //................Admin-TeacherRaing...................\
    app.get("/admin/all/teacherRating", [authJwt.verifyToken, authJwt.isAdmin],
        teacherRating.findAllTeacherRating);

    app.post("/admin/create/teacherRating", [authJwt.verifyToken, authJwt.isAdmin],
        teacherRating.createTeacherRating);

    app.post("/admin/search/teacherRating", [authJwt.verifyToken, authJwt.isAdmin],
        teacherRating.searchTeacherRatig);

    app.put("/admin/delete/all/teacherRating", [authJwt.verifyToken, authJwt.isAdmin],
        teacherRating.deleteAllTeacherRating);

    app.delete("/admin/delete/all/teacherRating", [authJwt.verifyToken, authJwt.isAdmin],
        teacherRating.deleteAllTeacherRating);

//................Admin-Chat...................\
    app.get("/admin/all/chats", [authJwt.verifyToken, authJwt.isAdmin],
        chatHistory.AllChat);
};