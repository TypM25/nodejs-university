
const db = require("../models/index.js");

const gradeTermService = require('../services/gradeTerm.service.js');
const GradeTerm = db.gradeTerm

exports.findAllGradeTerm = async (req, res) => {
    try {
        const gradeDetails = await GradeTerm.findAll()
        if (gradeDetails.length === 0) {
            return res.status(200).send({
                message: "GradeTerm data is empty.",
                data: null,
                status_code: 200
            })
        }
        res.status(200).send({
            message: "Fetching gradeDetail successfully.",
            data: gradeDetails,
            status_code: 200
        });
    }
    catch (err) {
        res.status(500).send({
            message: "Error : " + err.message,
            data: null,
            status_code: 500
        });
    }
}

// exports.updateGradeTerm = async (req, res) => {
//     try {
//         const { canOperated, status_code, set_message } = await gradeDetailUtil.checkDataNotfound(req.body.student_id, req.body.subject_id, req.body.term_id, req.body.score)
//         // console.log("status_code ===> ",status_code)
//         if (!canOperated) {
//             return res.status(status_code).send({
//                 message: set_message,
//                 data: null,
//                 status_code: status_code
//             });
//         }
//         const check_student_subject = await studentUtil.checkIsStudentAddThisSubject(req.body.student_id, req.body.subject_id)
//         console.log("check_student_subject ===> ", check_student_subject)
//         if (check_student_subject.status_code !== 200) {
//             return res.status(check_student_subject.status_code).send({
//                 message: check_student_subject.set_message,
//                 data: null,
//                 status_code: check_student_subject.status_code,
//             });
//         }


//         const cal_gradeDetail = await gradeDetailService.calculateGradeTerm(req.body.score)
//         const inputData = {
//             student_id: req.body.student_id,
//             subject_id: req.body.subject_id,
//             term_id: req.body.term_id,
//             gradeDetail: cal_gradeDetail,
//             score: req.body.score
//         }

//         const gradeDetail = await GradeTerm.update(inputData, { where: { student_id: inputData.student_id } })
//         res.status(200).send({
//             message: "Update gradeDetail successfully",
//             data: gradeDetail,
//             status_code: 200
//         });
//     }
//     catch (err) {
//         res.status(500).send({
//             message: "Error : " + err.message,
//             data: null,
//             status_code: 500
//         });
//     }
// }

exports.deleteAllGradeTerm = async (req, res) => {
    try {
        const gradeDetails = await GradeTerm.destroy({
            where: {},
            truncate: true,
            restartIdentity: true
        })
        if (gradeDetails.length === 0) {
            return res.status(200).send({
                message: "GradeTerm data is empty.",
                data: null,
                status_code: 200
            })
        }
        res.status(200).send({
            message: "Deleting gradeDetails successfully.",
            data: gradeDetails,
            status_code: 200
        });
    }
    catch (err) {
        res.status(500).send({
            message: "Error : " + err.message,
            data: null,
            status_code: 500
        });
    }
}




