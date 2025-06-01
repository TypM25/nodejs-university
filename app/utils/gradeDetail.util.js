const { where } = require('sequelize');
const db = require('../models');
const Op = db.Sequelize.Op;

//เกรด
exports.calculateGradeDetail = async (score) => {
    let gradeDetail = "I"

    if (score >= 80) {
        gradeDetail = "A";
    } else if (score >= 75) {
        gradeDetail = "B+";
    } else if (score >= 70) {
        gradeDetail = "B";
    } else if (score >= 65) {
        gradeDetail = "C+";
    } else if (score >= 60) {
        gradeDetail = "C";
    } else if (score >= 55) {
        gradeDetail = "D+";
    } else if (score >= 50) {
        gradeDetail = "D";
    } else {
        gradeDetail = "F";
    }

    return gradeDetail
}


