const db = require('../models');
const Op = db.Sequelize.Op;
const Evaluation = db.evaluation;
const EvaluationDetail = db.evaluationDetail
const Student = db.student
const Teacher = db.teacher
const Semester = db.semester
const Question = db.question


exports.calculateEvaluation = async (student_id, teacher_id, term_id) => {
    let canOperated = true
    const total_evaluation_detail = await EvaluationDetail.findAll({
        where: {
            student_id: student_id,
            teacher_id: teacher_id,
            term_id: term_id
        }
    })
    if (total_evaluation_detail.length !== 10) {
        return {
            canOperated: false,
            sum_score: null
        }
    }
    const sum_score = total_evaluation_detail.reduce((sum, item) => sum + item.score, 0)
    return {
        canOperated,
        sum_score
    }
}
