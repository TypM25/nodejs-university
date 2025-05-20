module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull : false
      },
      username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull : false
      },
      password: {
        type: Sequelize.STRING,
        allowNull : false
      }
    });
  
    return User;
  };