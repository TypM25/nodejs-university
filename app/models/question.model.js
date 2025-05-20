//ตารางคำถาม
module.exports = (sequelize, Sequelize) => {
    const Question = sequelize.define("question", {
        question_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        question_name: {
            type: Sequelize.STRING,
        },
        points: {
            type: Sequelize.INTEGER,
        },
    });

    return Question;
};
