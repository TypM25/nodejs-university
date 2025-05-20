// gradeDetail.model.js
module.exports = (sequelize, Sequelize) => {
    const GradeTerm = sequelize.define("gradeTerm", {
        student_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: 'compositeIndex',
            references: {
                model: 'students',
                key: 'student_id'
            },
        },
        term_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: 'compositeIndex',
            references: {
                model: 'semesters',
                key: 'term_id'
            },
        },
        GPA: {
            type: Sequelize.DECIMAL(3, 2),
            allowNull: false
        }
    });
    return GradeTerm;
};
