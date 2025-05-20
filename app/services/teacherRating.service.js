const db = require('../models');
const Op = db.Sequelize.Op;

const Evaluation = db.evaluation;

exports.calculateTeacherRating = async (teacher_id, term_id) => {
    const evaluation = await Evaluation.findAll({
        where: {
            teacher_id: teacher_id,
            term_id: term_id
        }
    })

    const sum_scores = evaluation.reduce((sum, item) => sum + item.score, 0) ;
    const avg_score = (sum_scores / evaluation.length).toFixed(2);
    const rating = ((avg_score / 50) * 10).toFixed(2);

    return {
        avg_score,
        rating
    }
}


