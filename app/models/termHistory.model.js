module.exports = (sequelize, Sequelize) => {
    const TermHistory = sequelize.define("termHistory", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },          
        term_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'semesters',
                key: 'term_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        student_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'students',
                key: 'student_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        subject_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'subjects',
                key: 'subject_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        }
    });

    return TermHistory;
};
