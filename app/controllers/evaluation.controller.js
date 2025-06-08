const db = require("../models");
const Op = db.Sequelize.Op;
const { where, cast, col } = require('sequelize');
var jwt = require("jsonwebtoken");
const dayjs = require('dayjs');
const { SuccessRes, ErrorRes, ErrorCatchRes } = require('../utils/response.util.js')

const evaluationService = require('../services/evaluation.service.js');

const Evaluation = db.evaluation

//########################## CREATE ##########################
exports.createEnvaluation = async (req, res) => {
    const { canOperated, status_code, set_message } = await evaluationService.checkDataNotfound(req.body.student_id, req.body.teacher_id, req.body.term_id)
    if (!canOperated) return res.status(status_code).send(new ErrorRes(set_message, status_code))

    const score = await evaluationService.calculateEvaluation(req.body.student_id, req.body.teacher_id, req.body.term_id)
    const inputData = {
        student_id: req.body.student_id,
        teacher_id: req.body.teacher_id,
        term_id: req.body.term_id,
        score: score.sum_score //เต็ม50
    }

    try {
        // const checkData = await Evaluation.findAll({
        //     where:
        //     {
        //         student_id: inputData.student_id,
        //         teacher_id: inputData.teacher_id,
        //         term_id: inputData.term_id,
        //     }
        // })
        // if (checkData.length > 0) {
        //     res.status(409).send({
        //         message: "Already create evaluation.",
        //         data: null,
        //         status_code: 409
        //     });
        // }

        const evaluation = await Evaluation.create(inputData)
        res.status(200).send(new SuccessRes("Creating evaluation successfully.", evaluation))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

//########################## FIND ##########################
exports.findAllEnvaluation = async (req, res) => {

    try {
        const evaluation = await Evaluation.findAll()
        res.status(200).send(new SuccessRes("Fetching successfully.", evaluation))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

exports.findEnvaluationById = async (req, res) => {
    const evaluation_id = req.body.evaluation_id
    try {
        const evaluation = await Evaluation.findByPk(evaluation_id)
        res.status(200).send(new SuccessRes("Fetching successful.", evaluation))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}
//########################## DELETE ##########################
exports.deleteAllEvaluation = async (req, res) => {
    try {
        const evaluation = await Evaluation.destroy({
            where: {},
            truncate: true,
            restartIdentity: true
        })
        res.status(200).send(new SuccessRes("Destroy all evaluation successfully.", evaluation))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

exports.deleteEvaluation = async (req, res) => {
    const evaluation_id = req.body.evaluation_id
    try {
        const evaluation = await Evaluation.destroy({ where: { evaluation_id: evaluation_id } })
        res.status(200).send(new SuccessRes("Destroy evaluation successfully.", evaluation))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}