const { where } = require('sequelize');
const db = require('../models');
const Op = db.Sequelize.Op;


const GradeDetail = db.gradeDetail

exports.calculateGPA = async (student_id, term_id) => {
    console.log("student_id : ", student_id)
    console.log("term_id : ", term_id)
    let total_sub_credits = 0;
    let total_credits = 0;
    const gradeDetail = await GradeDetail.findAll({
        where: {
            student_id: student_id,
            term_id: term_id
        }
    });
    
    console.log("gradeDetail ----> ", gradeDetail)
    for (let sub of gradeDetail) {
        let gradeDetailPoint = 0;

        if (sub.grade === "A") {
            gradeDetailPoint = 4.0;
        } else if (sub.grade === "B+") {
            gradeDetailPoint = 3.5;
        } else if (sub.grade === "B") {
            gradeDetailPoint = 3.0;
        } else if (sub.grade === "C+") {
            gradeDetailPoint = 2.5;
        } else if (sub.grade === "C") {
            gradeDetailPoint = 2.0;
        } else if (sub.grade === "D+") {
            gradeDetailPoint = 1.5;
        } else if (sub.grade === "D") {
            gradeDetailPoint = 1.0;
        } else if (sub.grade === "F") {
            gradeDetailPoint = 0.0;
        } else {
            gradeDetailPoint = 0.0;
        }
        total_sub_credits += gradeDetailPoint * sub.credits
        total_credits += sub.credits
        console.log("total_sub_credits : ",total_sub_credits)
        console.log("total_credits: ",total_credits)
    }
    console.log("Final total_sub_credits : ",total_sub_credits)
    console.log("Final total_credits: ",total_credits)
    const gpa = total_credits > 0 ? (total_sub_credits / total_credits) : 0.0;
    console.log("GPA : ",gpa)
    return {
        gpa
    }
}

