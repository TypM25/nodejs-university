//เก็บค่าเฉลี่ยรวมของอาจารย์ในเทอมนั้น
module.exports = (sequelize, Sequelize) => {
    const TeacherRating = sequelize.define("teacherRating", {
        teacher_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          references: {
            model: 'teachers',
            key: 'teacher_id'
          },
        },
        term_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          references: {
            model: 'semesters',
            key: 'term_id'
          },
        },
        avg_score: {
          type: Sequelize.DECIMAL(4, 2) 
        },
        rating_score: {
          type: Sequelize.DECIMAL(4, 2) //เต็ม10
        }
      }, {
        timestamps: false
      });
      
    return TeacherRating;
  };
  