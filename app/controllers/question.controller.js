
const db = require("../models");
const { where } = require("sequelize");
const { SuccessRes, ErrorRes, ErrorCatchRes } = require('../utils/response.util.js')

const Question = db.question

exports.createSingleQuestion = async (req, res) => {
    const inputData = {
        question_name: req?.body?.question_name,
        points: req?.body?.points
    }
    if (!inputData.question_name || inputData.points === undefined) {
        return res.status(404).send(new ErrorRes("Content is empty.", 404))
    }
    else if (typeof inputData.question_name !== 'string') {
        return res.status(400).send(new ErrorRes("Question name is not text.", 400))
    }
    else if (!Number.isInteger(inputData.points)) {
        return res.status(400).send(new ErrorRes("Please enter valid number values.", 400))
    }
    try {

        const checkQues = await Question.findOne({ where: { question_name: inputData.question_name } })
        if (checkQues) return res.status(400).send(new ErrorRes("This Question is already existed", 400))

        const question = await Question.create(inputData)

        res.status(200).send(new SuccessRes("Create question successfully!", question))

    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

exports.createMultiQuestion = async (req, res) => {
    // const inputData = req.body;
    const inputData = req.body
    for (let ques of inputData) {
        if (!ques.question_name || ques.points === undefined) {
            return res.status(400).send(new ErrorRes("Content is empty.", 400))
        }
        else if (typeof ques.question_name !== 'string') {
            return res.status(400).send(new ErrorRes("Question name is not text.", 400))
        }
        else if (!Number.isInteger(ques.points)) {
            return res.status(400).send(new ErrorRes("Please enter valid number values.", 400))
        }
        const checkQues = await Question.findOne({ where: { question_name: ques.question_name } })
        if (checkQues) {
            return res.status(400).send(new ErrorRes("This Question is already existed", 400))
        }
    }
    try {
        const question = await Question.bulkCreate(inputData)
        res.status(200).send(new SuccessRes("Create question successfully!", question))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

exports.findAllQuestion = async (req, res) => {
    try {
        const questions = await Question.findAll()
        res.status(200).send(new SuccessRes("Fetching data successfully.", questions))

    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
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
                if (!questions) return res.status(400).send(new ErrorRes(`Question is not found.`, 400))

                res.status(200).send(new SuccessRes(`Question ${inputCount} of ${total_question}`, questions))

            }
        }
        catch (error) {
            res.status(500).send(new ErrorCatchRes(error))
        }
    }
}

