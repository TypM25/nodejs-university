
const db = require("../models");
const { where } = require("sequelize");

const Question = db.question

exports.createSingleQuestion = async (req, res) => {
    const inputData = {
        question_name: req?.body?.question_name,
        points: req?.body?.points
    }
    if (!inputData.question_name || inputData.points === undefined) {
        return res.status(400).json({
            message: "Content is empty.",
            data: null,
            status_code: 400
        });
    }
    else if (typeof inputData.question_name !== 'string') {
        return res.status(400).json({
            message: "Question name is not text.",
            data: null,
            status_code: 400
        });
    }
    else if (!Number.isInteger(inputData.points)) {
        return res.status(400).json({
            message: "Please enter valid number values.",
            data: null,
            status_code: 400
        });
    }
    try {

        const checkQues = await Question.findOne({ where: { question_name: inputData.question_name } })
        if (checkQues) {
            return res.status(400).send({
                message: "คำถามซ้ำ",
                data: null,
                status_code: 400
            });
        }
        const question = await Question.create(inputData)
        res.status(200).send({
            message: "Create question successfully!",
            data: question,
            status_code: 200
        });
    }
    catch (err) {
        return res.status(500).send({
            message:
                err.message || "Some error occurred while creating the Subject.",
            data: null,
            status_code: 500
        });
    }
}

exports.createMultiQuestion = async (req, res) => {
    // const inputData = req.body;
    const inputData = req.body
    for (let ques of inputData) {
        if (!ques.question_name || ques.points === undefined) {
            return res.status(400).json({
                message: "Content is empty.",
                data: null,
                status_code: 400
            });
        }
        else if (typeof ques.question_name !== 'string') {
            return res.status(400).json({
                message: "Question name is not text.",
                data: null,
                status_code: 400
            });
        }
        else if (!Number.isInteger(ques.points)) {
            return res.status(400).json({
                message: "Please enter valid number values.",
                data: null,
                status_code: 400
            });
        }
        const checkQues = await Question.findOne({ where: { question_name: ques.question_name } })
        if (checkQues) {
            return res.status(400).send({
                message: "คำถามซ้ำ",
                data: null,
                status_code: 400
            });
        }
    }
    try {
        const question = await Question.bulkCreate(inputData)
        res.status(200).send({
            message: "Create question successfully!",
            data: question,
            status_code: 200
        });
    }
    catch (err) {
        return res.status(500).send({
            message:
                err.message || "Some error occurred while creating the Subject.",
            data: null,
            status_code: 500
        });
    }
}

exports.findAllQuestion = async (req, res) => {
    try {
        const questions = await Question.findAll()
        res.status(200).send({
            message: "Fetching data successfully.",
            data: questions,
            status_code: 200
        });
    }
    catch (err) {
        return res.status(500).send({
            message: err.message,
            data: null,
            status_code: 500
        });
    }
}

exports.findQuestionById = async (req, res) => {
    const inputCount = req.body.inputCount
    try {
        //นับคำถามทั้งหมด
        const total_question = await Question.count()
        //ถ้ากรอกค่า เเละมีคำถามในDB
        if (inputCount && total_question > 0) {
            //fetch คำถามทั้งหมด
            const questions = await Question.findOne({ where: { question_id: inputCount } })
            if(!questions){
                return res.status(404).send({
                    message: `Question is not found.`,
                    data: questions,
                    status_code: 404
                });
            }
            res.status(200).send({
                message: `Question ${inputCount} of ${total_question}`,
                data: questions,
                status_code: 200
            });

        }
    }
    catch (err) {
        return res.status(500).send({
            message: err.message,
            data: null,
            status_code: 500
        });
    }
}
