module.exports = (sequelize, Sequelize) => {
    const Role = sequelize.define("role", {
      role_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
      }
    });
  
    return Role;
  };