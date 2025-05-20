//บันทึกการประเมินรวมต่ออาจารย์ ต่อ (นิสิต1คน)
module.exports = (sequelize, Sequelize) => {
  const Evaluation = sequelize.define("evaluation", {
    evaluation_id: {
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
    score: {
      type: Sequelize.INTEGER //เต็ม50
    },

  });

  Evaluation.afterCreate(async (evaluation, options) => {
    const db = require('../models');
    const teacherRatingService = require('../services/teacherRating.service.js');
    const TeacherRating = db.teacherRating

    try {
      const { avg_score, rating } = await teacherRatingService.calculateTeacherRating(evaluation.teacher_id, evaluation.term_id)
      inputData = {
        teacher_id: evaluation.teacher_id,
        term_id: evaluation.term_id,
        avg_score: avg_score,
        rating_score: rating
      }
      const [teacher_rating, created] = await TeacherRating.findOrCreate({
        where: {
          teacher_id: evaluation.teacher_id,
          term_id: evaluation.term_id,
        },
        //ค่าที่สร้างถ้าไม่เจอข้อมูลในfind
        defaults: inputData
      });
      //ถ้าไม่ได้สร้าง
      if (!created) {
        const update = await TeacherRating.update(
          {
            avg_score: avg_score,
            rating_score: rating
          },
          {
            where: {
              teacher_id: evaluation.teacher_id,
              term_id: evaluation.term_id
            }
          }
        );

        console.log("Update successfully: ", update);
      } else {
        console.log("Created teacherRating successfully: ", teacher_rating.toJSON());
      }


    } catch (err) {
      console.error("Error:", err.message);
    }
  });

  Evaluation.afterBulkDestroy(async (evaluation, options) => {
    const db = require('../models');
    const TeacherRating = db.teacherRating;

    try {
      console.log("Evaluation is destroyed by afterDestroy of Evaluation.");

      await TeacherRating.destroy({
        where: {},
        truncate: true,
        restartIdentity: true
      });

      console.log("All evaluations have been deleted.");
    } catch (err) {
      console.error("Error deleting TeacherRating:", err.message);
    }
  });


  return Evaluation;
};
