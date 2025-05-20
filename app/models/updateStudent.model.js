module.exports = (sequelize, Sequelize) => {
  const UpdateStudent = sequelize.define("updateStudent", {
    //updated_by STRING
    //student_id
    update_type: {
      type: Sequelize.STRING,
    }, 
    student_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    new_data: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    old_data: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  });

  return UpdateStudent;
};