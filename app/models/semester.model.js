module.exports = (sequelize, Sequelize) => {
    const Semester = sequelize.define("semester", {
      term_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      term_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      is_open: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }
    });
  
    return Semester;
  };
  