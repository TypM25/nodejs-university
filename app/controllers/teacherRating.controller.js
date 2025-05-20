const { where } = require("sequelize");
const db = require("../models");
const dayjs = require('dayjs');
const Op = db.Sequelize.Op;

const teacherRatingService = require('../services/teacherRating.service.js');

const TeacherRating = db.teacherRating

exports.createTeacherRating = async (req, res) => {
    const {avg_score, rating} = await teacherRatingService.calculateTeacherRating(req.body.teacher_id, req.body.term_id)
    const inputData = {
        teacher_id : req.body.teacher_id,
        term_id: req.body.term_id,
        avg_score: avg_score,
        rating_score: rating
    }
    // console.log("Teacher_id : "+inputData.teacher_id)
    // console.log("term_id : "+inputData.term_id)
    console.log("avg_score : "+ avg_score)
    console.log("rating_score : "+ rating)
    
    try {
        const teach_rating = await TeacherRating.create(inputData)
        res.status(200).send({
            message: "Create teacherRating successfully",
            data: teach_rating,
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


exports.findAllTeacherRating = async (req, res) => {

    try {
        const teach_rating = await TeacherRating.findAll()
        res.status(200).send({
            message: "Find all teacherRating successfully",
            data: teach_rating,
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

exports.updateTeacherRating = async (req, res) =>{
    
    try{
        
    }
    catch (err) {
        res.status(500).send({
            message: "Error : " + err.message,
            data: null,
            status_code: 500
        })
    }
}

exports.deleteAllTeacherRating = async (req, res) => {
    try {
        const evaluation_detail = await TeacherRating.destroy({
            where: {},
            truncate: true,
            restartIdentity: true 
        })
        res.status(200).send({
            message: "Destroy all teacher_rating successfully.",
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