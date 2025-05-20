const { Sequelize } = require(".");
const { PASSWORD } = require("../config/db.config");

module.exports = (sequelize, Sequelize) => {
    const Teacher = sequelize.define("teacher", {
        teacher_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        teacher_first_name: {
            type: Sequelize.STRING,
        },
        teacher_last_name: {
            type: Sequelize.STRING,
        },

    });

    return Teacher;
};