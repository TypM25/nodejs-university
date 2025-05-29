const db = require("../models");
const Op = db.Sequelize.Op;
const { where, cast, col } = require('sequelize');
var jwt = require("jsonwebtoken");
const dayjs = require('dayjs');

const evaluationDetailUtil = require('../utils/evaluationDetail.util.js');
const studentUtil = require('../utils/student.util.js');

const EvaluationDetail = db.evaluationDetail

//########################## CREATE ##########################
exports.createEvaluationDetail = async (req, res) => {
    const { canOperated, status_code, set_message } = await evaluationDetailUtil.checkDataNotfound(req.body.student_id, req.body.teacher_id, req.body.term_id, req.body.question_id)
    if (!canOperated) {
        return res.status(status_code).send({
            message: set_message,
            data: null,
            status_code: status_code
        });
    }
    const check_student_teacher = await studentUtil.checkStudentTeacher(req.body.student_id, req.body.teacher_id)
    if (check_student_teacher.canOperated === false) {
        return res.status(check_student_teacher.status_code).send({
            message: check_student_teacher.set_message,
            data: null,
            status_code: check_student_teacher.status_code
        });
    }

    const inputData = {
        teacher_id: req.body.teacher_id,
        student_id: req.body.student_id,
        question_id: req.body.question_id,
        term_id: req.body.term_id,
        score: req.body.score,
    }
    try {
        const checkData = await EvaluationDetail.findAll({
            where:
            {
                student_id: inputData.student_id,
                teacher_id: inputData.teacher_id,
                question_id: inputData.question_id,
                term_id: inputData.term_id,
            }
        })
        if (checkData.length > 0) {
            return res.status(409).send({
                message: "Already create evaluationDetail with this question.",
                data: null,
                status_code: 409
            });
        }
        const evaluation_detail = await EvaluationDetail.create(inputData)

        res.status(200).send({
            message: "Creating evaluation_detail successfully.",
            data: evaluation_detail,
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

exports.createMultiEvaluationDetail = async (req, res) => {
    const rawData = req.body;
    const inputData = rawData.map(data => ({
        student_id: Number(data.student_id),
        teacher_id: Number(data.teacher_id),
        term_id: Number(data.term_id),
        question_id: Number(data.question_id),
        score: Number(data.score),
    }));
    //ถ้ายังไม่ครบ10 
    if (inputData.length !== 10) {
        return res.status(400).send({
            message: "กรุณาประเมินทุกข้อ",
            data: null,
            status_code: 400
        });
    }
    for (let item of inputData) {
        //เช็คข้อมูลที่ไม่มีในdb
        const { canOperated, status_code, set_message } = await evaluationDetailUtil.checkDataNotfound(item.student_id, item.teacher_id, item.term_id, item.question_id)
        if (!canOperated) {
            return res.status(status_code).send({
                message: set_message,
                data: null,
                status_code: status_code

            });
        }
        //เช็คว่านิสิตได้เรียนกับครูคนนี้มั้ย
        const check_student_teacher = await studentUtil.checkStudentTeacher(item.student_id, item.teacher_id)
        if (check_student_teacher.canOperated === false) {
            return res.status(check_student_teacher.status_code).send({
                message: check_student_teacher.set_message,
                data: null,
                status_code: check_student_teacher.status_code
            });
        }
        //เช็คว่าตอบ10 คำถามไปยัง
        const checkAlreadyVote = await EvaluationDetail.findAll({
            where: {
                student_id: item.student_id,
                teacher_id: item.teacher_id,
                term_id: item.term_id
            }
        })
        //ถ้าครบ
        if (checkAlreadyVote.length === 10) {
            return res.status(409).send({
                message: "This student is already answer.",
                data: null,
                status_code: 409
            });
        }
        //เช็คตอบคำถามซ้ำ
        const checkEvaDetail = await EvaluationDetail.findOne({
            where: {
                student_id: item.student_id,
                teacher_id: item.teacher_id,
                question_id: item.question_id,
                term_id: item.term_id
            }
        })
        //ถ้าซ้ำ
        if (checkEvaDetail) {
            return res.status(409).send({
                message: "คุณประเมินอาจารย์คำถามซ้ำ",
                data: null,
                status_code: 409
            });
        }
    }

    try {
        const evaluation_detail = await EvaluationDetail.bulkCreate(inputData, {
            individualHooks: true // เรียกใช้ afterCreate สำหรับแต่ละรายการ
        });
        res.status(200).send({
            message: "Create evaluationDetail successfully!",
            data: evaluation_detail,
            status_code: 200
        });
    }
    catch (err) {
        return res.status(500).send({
            message: "Error : " + err.message,
            data: null,
            status_code: 500
        });
    }
}

//########################## FIND ##########################
exports.findAllEnvaluationDetail = async (req, res) => {
    try {
        const evaluation_detail = await EvaluationDetail.findAll();
        res.status(200).send({
            message: "Fetching successfully.",
            data: evaluation_detail,
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

exports.findEnvaluationDetailById = async (req, res) => {
    const pk = {
        teacher_id: req.body.teacher_id,
        student_id: req.body.student_id,
        question_id: req.body.question_id,
        term_id: req.body.term_id,
    }
    try {
        const evaluation_detail = await EvaluationDetail.findOne({
            where: {
                teacher_id: pk.teacher_id,
                student_id: pk.student_id,
                question_id: pk.question_id,
                term_id: pk.term_id
            }
        });
        res.status(200).send({
            message: "Fetching successfully.",
            data: evaluation_detail,
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

//########################## CHECK ##########################
exports.checkAlreadyAnswer = async (req, res) => {

    const student_id = req.body.student_id
    const teacher_id = req.body.teacher_id
    const term_id = req.body.term_id
    let teacherIdArray = [];

    if (Array.isArray(teacher_id)) {
        teacherIdArray = teacher_id;
    } else {
        teacherIdArray = [teacher_id]; // แปลงเป็น array ถ้ามีแค่คนเดียว
    }

    const inputData = {
        student_id: student_id,
        teacher_id: teacherIdArray,
        term_id: term_id
    };

    // const check_student_teacher = await studentUtil.checkStudentTeacher(req.body.student_id, req.body.teacher_id)
    // if (check_student_teacher.canOperated === false) {
    //     return res.status(check_student_teacher.status_code).send({
    //         message: check_student_teacher.set_message,
    //         data: null,
    //         status_code: check_student_teacher.status_code
    //     });
    // }

    try {
        const checkAlreadyVote = await EvaluationDetail.findAll({
            where: {
                student_id: inputData.student_id,
                teacher_id: {
                    [Op.in]: inputData.teacher_id
                },
                term_id: inputData.term_id
            }
        })
        if (checkAlreadyVote.length === teacherIdArray.length * 10) {
            return res.status(409).send({
                message: "This student is already answer.",
                data: null,
                status_code: 409
            });
        }
        res.status(200).send({
            message: "This student is not answer yet.",
            data: null,
            status_code: 200
        });
    }
    catch (err) {
        return res.status(500).send({
            message: "Error : " + err.message,
            data: null,
            status_code: 500
        });
    }
}

//########################## DELETE ##########################
exports.deleteAllEvaluationDetail = async (req, res) => {
    try {
        const evaluation_detail = await EvaluationDetail.destroy({
            where: {},
            truncate: true,
            restartIdentity: true
        })
        res.status(200).send({
            message: "Destroy all evaluation_detail successfully.",
            data: evaluation_detail,
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

exports.deleteEvaluationDetail = async (req, res) => {
    const pk = {
        teacher_id: req.body.teacher_id,
        student_id: req.body.student_id,
        question_id: req.body.question_id,
        term_id: req.body.term_id,
    }
    try {
        const evaluation = await EvaluationDetail.destroy({
            where: {
                student_id: pk.student_id,
                teacher_id: pk.teacher_id,
                question_id: pk.question_id,
                term_id: pk.term_id
            }
        });
        res.status(200).send({
            message: "Destroy evaluation successfully.",
            data: evaluation,
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
