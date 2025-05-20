module.exports = (sequelize, Sequelize) => {
  const Student = sequelize.define("student", {
    student_id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    student_first_name: {
      type: Sequelize.STRING,
    },
    student_last_name: {
      type: Sequelize.STRING
    }
  });

  return Student;
};