// models/subject_student.js
module.exports = (sequelize, DataTypes) => {
  const SubjectStudent = sequelize.define('subject_student', {
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    freezeTableName: true 
  });
  
    return SubjectStudent;
  };
  