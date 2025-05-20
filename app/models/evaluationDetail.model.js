//บันทึกคำตอบแบบแยกข้อ
module.exports = (sequelize, Sequelize) => {
    const EvaluationDetail = sequelize.define("evaluationDetail", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        student_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'students',
                key: 'student_id'
            },
            unique: 'compositeIndex'
        },
        teacher_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'teachers',
                key: 'teacher_id'
            },
            unique: 'compositeIndex'
        },
        term_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'semesters',
                key: 'term_id'
            },
            unique: 'compositeIndex'
        },
        question_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'questions',
                key: 'question_id'
            },
            unique: 'compositeIndex'
        },
        score: {
            type: Sequelize.INTEGER //เต็ม5
        },

    });

    EvaluationDetail.afterCreate(async (evaluationDetail, options) => {
        const db = require('../models');
        const evaluationService = require('../services/evaluation.service.js');
        const evaluationUtil = require('../utils/evaluation.util.js');
        const Evaluation = db.evaluation

        try {
            const { canOperated, set_message } = await evaluationUtil.checkDataNotfound(evaluationDetail.student_id, evaluationDetail.teacher_id, evaluationDetail.term_id);
            if (!canOperated) {
                console.log(set_message);
                return;
            }

            const score = await evaluationService.calculateEvaluation(evaluationDetail.student_id, evaluationDetail.teacher_id, evaluationDetail.term_id);

            console.log("Calculated score:", score.sum_score);
            if (!score.canOperated) {

                return console.log("Can not calculate cuz score.length < 0.")
            }
            const inputData = {
                student_id: evaluationDetail.student_id,
                teacher_id: evaluationDetail.teacher_id,
                term_id: evaluationDetail.term_id,
                score: score.sum_score //เต็ม50
            };

            const evaluation = await Evaluation.findOne({
                where: {
                    student_id: inputData.student_id,
                    teacher_id: inputData.teacher_id,
                    term_id: inputData.term_id,
                }
            });

            if (evaluation) {
                await evaluation.update({ score: inputData.score });
                console.log("Updated evaluation successfully.");
            } else {
                const newEvaluation = await Evaluation.create(inputData);
                console.log("Created new evaluation successfully:", newEvaluation.toJSON());
            }


        } catch (err) {
            console.error("Error:", err.message);
        }
    });

    EvaluationDetail.afterBulkDestroy(async (evaluationDetail, options) => {
        const db = require('../models');
        const Evaluation = db.evaluation;
    
        try {
            console.log("Evaluation is destroyed by afterDestroy of EvaluationDetail.");
    
            await Evaluation.destroy({
                where: {},
                truncate: true,         
                restartIdentity: true    
            });
    
            console.log("All evaluations have been deleted.");
        } catch (err) {
            console.error("Error deleting evaluations:", err.message);
        }
    });
    

    return EvaluationDetail;
};

