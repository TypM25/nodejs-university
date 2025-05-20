module.exports = (sequelize, Sequelize) => {
  const Subject = sequelize.define("subject", {
    subject_id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    subject_name: {
      type: Sequelize.STRING,
    },
    credits: {
      type: Sequelize.INTEGER,
    },
  });

  return Subject;
};