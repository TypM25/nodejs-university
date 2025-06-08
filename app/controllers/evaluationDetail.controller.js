const db = require("../models");
const Op = db.Sequelize.Op;
const { where, cast, col } = require('sequelize');
var jwt = require("jsonwebtoken");
const dayjs = require('dayjs');
const { SuccessRes, ErrorRes, ErrorCatchRes } = require('../utils/response.util.js')

const evaluationDetailService = require('../services/evaluationDetail.service.js');
const studentService = require('../services/student.service.js');

const EvaluationDetail = db.evaluationDetail

//########################## CREATE ##########################
exports.createEvaluationDetail = async (req, res) => {
    const { canOperated, status_code, set_message } = await evaluationDetailService.checkDataNotfound(req.body.student_id, req.body.teacher_id, req.body.term_id, req.body.question_id)
    if (!canOperated) return res.status(status_code).send(new ErrorRes(set_message, status_code))

    const check_student_teacher = await studentService.checkStudentTeacher(req.body.student_id, req.body.teacher_id)
    if (check_student_teacher.canOperated === false) {
        return res.status(check_student_teacher.status_code).send(new ErrorRes(set_mescheck_student_teacher.set_messageage, check_student_teacher.status_code))
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
        if (checkData.length > 0) return res.status(409).send(new ErrorRes("Already create evaluationDetail with this question.", 409))

        const evaluation_detail = await EvaluationDetail.create(inputData)
        res.status(200).send(new SuccessRes("Creating evaluation_detail successfully.", evaluation_detail))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
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
    if (inputData.length !== 10) return res.status(400).send(new ErrorRes("กรุณาประเมินทุกข้อ", 400))

    for (let item of inputData) {
        //เช็คข้อมูลที่ไม่มีในdb
        const { canOperated, status_code, set_message } = await evaluationDetailService.checkDataNotfound(item.student_id, item.teacher_id, item.term_id, item.question_id)
        if (!canOperated) return res.status(status_code).send(new ErrorRes(set_message, status_code))

        //เช็คว่านิสิตได้เรียนกับครูคนนี้มั้ย
        const check_student_teacher = await studentService.checkStudentTeacher(item.student_id, item.teacher_id)
        if (check_student_teacher.canOperated === false) return res.status(check_student_teacher.status_code).send(new ErrorRes(check_student_teacher.set_message, check_student_teacher.status_code))

        //เช็คว่าตอบ10 คำถามไปยัง
        const checkAlreadyVote = await EvaluationDetail.findAll({
            where: {
                student_id: item.student_id,
                teacher_id: item.teacher_id,
                term_id: item.term_id
            }
        })
        //ถ้าครบ
        if (checkAlreadyVote.length === 10) return res.status(409).send(new ErrorRes("This student is already answer.", 409))

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
        if (checkEvaDetail) return res.status(409).send(new ErrorRes("คุณประเมินอาจารย์คำถามซ้ำ", 409))
    }

    try {
        const evaluation_detail = await EvaluationDetail.bulkCreate(inputData, {
            individualHooks: true // เรียกใช้ afterCreate สำหรับแต่ละรายการ
        });
        res.status(200).send(new SuccessRes("Create evaluationDetail successful!", evaluation_detail))

    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

//########################## FIND ##########################
exports.findAllEnvaluationDetail = async (req, res) => {
    try {
        const evaluation_detail = await EvaluationDetail.findAll();
        res.status(200).send(new SuccessRes("Fetching successful!", evaluation_detail))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
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
        res.status(200).send(new SuccessRes("Fetching successful!", evaluation_detail))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
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

    // const check_student_teacher = await studentService.checkStudentTeacher(req.body.student_id, req.body.teacher_id)
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
        if (checkAlreadyVote.length === teacherIdArray.length * 10) return res.status(409).send(new ErrorRes("This student is already answer.", 409))

        res.status(200).send(new SuccessRes("This student is not answer yet."))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
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
        res.status(200).send(new SuccessRes("Destroy all evaluation_detail successfully.", evaluation_detail))

    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
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
        res.status(200).send(new SuccessRes("Destroy evaluation successful.", evaluation))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}
