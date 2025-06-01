const db = require('../models');
const Op = db.Sequelize.Op;

const Evaluation = db.evaluation;

//คำนวณเรตติ้งอาจารย์
exports.calculateTeacherRating = async (teacher_id, term_id) => {
    const evaluation = await Evaluation.findAll({
        where: {
            teacher_id: teacher_id,
            term_id: term_id
        }
    })

    //สูตรคำนวณ
    const sum_scores = evaluation.reduce((sum, item) => sum + item.score, 0) ; //รวมคะแนนจากนิสิตทั้งหมด
    const avg_score = (sum_scores / evaluation.length).toFixed(2); //หาคะแนนเฉลี่ย avg_score= ผลรวมคะแนนทั้งหมดของนิสิต/จำนวนครั้งที่นิสิตประเมิน
    const rating = ((avg_score / 50) * 10).toFixed(2); //rating = (avg_score/full_score)*10 

    return {
        avg_score,
        rating
    }
}


