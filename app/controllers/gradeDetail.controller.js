
const { where } = require("sequelize");
const db = require("../models/index.js");
const Op = db.Sequelize.Op;

const gradeDetailService = require('../services/gradeDetail.service.js');
const gradeDetailUtil = require('../utils/gradeDetail.util.js');
const studentUtil = require('../utils/student.util.js');

const Subject = db.subject
const GradeDetail = db.gradeDetail

exports.createGradeDetail = async (req, res) => {
    try {
        //เช็คว่าข้อมูลมีมั้ย
        const { canOperated, status_code, set_message } = await gradeDetailUtil.checkDataNotfound(req.body.student_id, req.body.subject_id, req.body.term_id, req.body.score)
        // console.log("status_code ===> ",status_code)
        if (!canOperated) {
            return res.status(status_code).send({
                message: set_message,
                data: null,
                status_code: status_code
            });
        }
        const check_student_subject = await studentUtil.checkIsStudentAddThisSubject(req.body.student_id, req.body.subject_id)
        if (check_student_subject.status_code !== 200) {
            return res.status(check_student_subject.status_code).send({
                message: check_student_subject.set_message,
                data: null,
                status_code: check_student_subject.status_code,
            });
        }

        //คำนวณเกรด
        const credits_sub = await Subject.findByPk(req.body.subject_id)
        console.log("credits_sub ==>", credits_sub)
        const cal_gradeDetail = await gradeDetailService.calculateGradeDetail(req.body.score)
        const inputData = {
            student_id: req.body.student_id,
            subject_id: req.body.subject_id,
            term_id: req.body.term_id,
            grade: cal_gradeDetail,
            score: req.body.score,
            credits: credits_sub.credits
        }

        const [gradeDetail, created] = await GradeDetail.findOrCreate({
            where: {
                student_id: inputData.student_id,
                subject_id: inputData.subject_id,
                term_id: inputData.term_id,
            },
            //ค่าที่สร้างถ้าไม่เจอข้อมูลในfind
            defaults: inputData
        });

        if (!created) {
            res.status(409).send({
                message: "Already created gradeDetail of this student and this subject.",
                data: null,
                status_code: 409
            });
        }
        else {
            res.status(200).send({
                message: "Created gradeDetail successfully.",
                data: gradeDetail,
                status_code: 200
            });
        }
    }
    catch (err) {
        res.status(500).send({
            message: "Error : " + err.message,
            data: null,
            status_code: 500
        });
    }
}

exports.createUpdateMultiGradeDetail = async (req, res) => {
    const rawData = req.body;
    const inputData = rawData?.map(data => ({
        student_id: Number(data.student_id),
        subject_id: Number(data.subject_id),
        term_id: Number(data.term_id),
        score: Number(data.score),
        credits: Number(data.credits),
    }));
    if (inputData.length === 0) {
        return res.status(400).send({
            message: "Please edit some data.",
            data: null,
            status_code: 400
        });
    }


    const updateData = []
    const createData = []
    for (let item of inputData) {
        if (item.score < 0) {
            return res.status(400).send({
                message: "Score must more than 0.",
                data: null,
                status_code: 400
            });
        }
        else if (item.score > 100) {
            return res.status(400).send({
                message: "Scores must less than 100.",
                data: null,
                status_code: 400
            });
        }
        //เช็คinputตัวไหน notfound
        const { canOperated, status_code, set_message } = await gradeDetailUtil.checkDataNotfound(item.student_id, item.subject_id, item.term_id, item.score)
        if (!canOperated) {
            return res.status(status_code).send({
                message: set_message,
                data: null,
                status_code: status_code
            });
        }
        //เช็คนิสิตคนนี้ได้ลงทะเบียนวิชานี้มั้ย
        const check_student_subject = await studentUtil.checkIsStudentAddThisSubject(item.student_id, item.subject_id)
        if (check_student_subject.status_code !== 200) {
            return res.status(check_student_subject.status_code).send({
                message: check_student_subject.set_message,
                data: null,
                status_code: check_student_subject.status_code,
            });
        }
        //หน่วยกิตวิชา
        const credits_sub = await Subject.findByPk(item.subject_id)
        //เเปลงคะแนนเป็นเกรด
        const cal_gradeDetail = await gradeDetailService.calculateGradeDetail(item.score)

        //checkข้อมูลซ้ำ
        const check_exist = await GradeDetail.findOne({
            where: {
                student_id: item.student_id,
                subject_id: item.subject_id,
                term_id: item.term_id,
            },
        });
        //ถ้าข้อมูลซ้ำ
        if (check_exist) {
            updateData.push({
                student_id: item.student_id,
                subject_id: item.subject_id,
                term_id: item.term_id,
                grade: cal_gradeDetail,
                score: item.score,
                credits: credits_sub.credits,
            });
        } else {
            createData.push({
                student_id: item.student_id,
                subject_id: item.subject_id,
                term_id: item.term_id,
                grade: cal_gradeDetail,
                score: item.score,
                credits: credits_sub.credits,
            });
        }
    }

    try {
        if (updateData.length > 0) {
            for (const item of updateData) {
                await GradeDetail.update({
                    grade: item.grade,
                    score: item.score,
                    credits: item.credits,
                }, {
                    where: {
                        student_id: item.student_id,
                        subject_id: item.subject_id,
                        term_id: item.term_id,
                    },
                    individualHooks: true,
                });
            }
        }
        if (createData.length > 0) {
            await GradeDetail.bulkCreate(createData, {
                conflictFields: ['student_id', 'subject_id', 'term_id'],
                individualHooks: true
            });
        }
        res.status(200).send({
            message: "Create and update gradeDetail successfully!",
            data: null,
            status_code: 200
        });

    } catch (err) {
        return res.status(500).send({
            message: "Error : " + err.message,
            data: null,
            status_code: 500
        });
    }
}


// exports.createMultiGradeDetail = async (req, res) => {
//     const rawData = req.body;

//     const req_data = rawData.map(data => ({
//         student_id: Number(data.student_id),
//         subject_id: Number(data.subject_id),
//         term_id: Number(data.term_id),
//         score: Number(data.score),
//     }));

//     for (let item of req_data) {
//         const { canOperated, status_code, set_message } = await gradeDetailUtil.checkDataNotfound(item.student_id, item.subject_id, item.term_id, item.score);
//         if (!canOperated) {
//             return res.status(status_code).send({
//                 message: set_message,
//                 data: null,
//                 status_code: status_code
//             });
//         }

//         const check_student_subject = await studentUtil.checkIsStudentAddThisSubject(item.student_id, item.subject_id);
//         if (check_student_subject.status_code !== 200) {
//             return res.status(check_student_subject.status_code).send({
//                 message: check_student_subject.set_message,
//                 data: null,
//                 status_code: check_student_subject.status_code,
//             });
//         }

//         const cal_gradeDetail = await gradeDetailService.calculateGradeDetail(item.score);

//         const inputData = {
//             student_id: item.student_id,
//             subject_id: item.subject_id,
//             term_id: item.term_id,
//             grade: cal_gradeDetail,
//             score: item.score,
//         }
//         try {
//             const result = await GradeDetail.bulkCreate(inputData, {
//                 // updateOnDuplicate: ['score', 'grade'],
//                 individualHooks: true
//             });

//             res.status(200).send({
//                 message: "Created or updated gradeDetails successfully.",
//                 data: result,
//                 status_code: 200
//             });
//         }
//         catch (err) {
//             return res.status(500).send({
//                 message: "Error : " + err.message,
//                 data: null,
//                 status_code: 500
//             });
//         }
//     }
// }


exports.findAllGradeDetail = async (req, res) => {
    try {
        const gradeDetails = await GradeDetail.findAll({
            order: [
                ['student_id', 'ASC'],
                ['subject_id', 'ASC']
            ]
        });

        if (gradeDetails.length === 0) {
            return res.status(200).send({
                message: "GradeDetail data is empty.",
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

exports.updateGradeDetail = async (req, res) => {
    try {
        const { canOperated, status_code, set_message } = await gradeDetailUtil.checkDataNotfound(req.body.student_id, req.body.subject_id, req.body.term_id, req.body.score)
        // console.log("status_code ===> ",status_code)
        if (!canOperated) {
            return res.status(status_code).send({
                message: set_message,
                data: null,
                status_code: status_code
            });
        }
        const check_student_subject = await studentUtil.checkIsStudentAddThisSubject(req.body.student_id, req.body.subject_id)
        console.log("check_student_subject ===> ", check_student_subject)
        if (check_student_subject.status_code !== 200) {
            return res.status(check_student_subject.status_code).send({
                message: check_student_subject.set_message,
                data: null,
                status_code: check_student_subject.status_code,
            });
        }

        const cal_gradeDetail = await gradeDetailService.calculateGradeDetail(req.body.score)
        const inputData = {
            student_id: req.body.student_id,
            subject_id: req.body.subject_id,
            term_id: req.body.term_id,
            grade: cal_gradeDetail,
            score: req.body.score
        }
        //-----อัพเดทแบบนี้จะtrigger to afterSave----
        // const gradeDetail = await GradeDetail.findOne({
        //     where: {
        //         student_id: inputData.student_id,
        //         subject_id: inputData.subject_id,
        //         term_id: inputData.term_id,
        //     }
        // })
        // gradeDetail.score = inputData.score;
        // gradeDetail.grade = inputData.grade;
        // await gradeDetail.save();

        const gradeDetail = await GradeDetail.update(inputData, {
            where: {
                student_id: inputData.student_id,
                subject_id: inputData.subject_id,
                term_id: inputData.term_id
            },
            individualHooks: true
        });

        res.status(200).send({
            message: "Update gradeDetail successfully",
            data: gradeDetail,
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

exports.deleteAllGradeDetail = async (req, res) => {
    try {
        const gradeDetails = await GradeDetail.destroy({
            where: {},
            truncate: true,
            restartIdentity: true
        })
        if (gradeDetails.length === 0) {
            return res.status(200).send({
                message: "GradeDetail data is empty.",
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

exports.deleteGradeDetailById = async (req, res) => {
    const inputData = {
        student_id: req.body.student_id,
        subject_id: req.body.subject_id,
        term_id: req.body.term_id
    }
    try {
        if (!inputData.student_id || !inputData.subject_id || !inputData.term_id) {
            return res.status(400).send({
                message: `Enter data.`,
                data: null,
                status_code: 400
            });
        }

        const grade = await GradeDetail.findOne(inputData);
        if (!grade) {
            return res.status(404).send({
                message: `GradeDetail is not found`,
                data: null,
                status_code: 404
            });
        }

        const result = await GradeDetail.destroy({
            where: {
                student_id: inputData.student_id,
                subject_id: inputData.subject_id,
                term_id: inputData.term_id,
            }
        })
        res.status(200).send({
            message: `GradeDetail deleted successfully`,
            data: result,
            status_code: 200
        })

    }
    catch (err) {
        res.status(500).send({
            message: "Error : " + err.message,
            data: null,
            status_code: 500
        })
    }
}



