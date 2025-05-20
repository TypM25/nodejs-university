module.exports = (sequelize, Sequelize) => {
    const UpdateSubject = sequelize.define("updateSubject", {
        //updated_by
        //subject_id
        update_type: {
            type: Sequelize.STRING,
        },
        subject_id: {
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

    return UpdateSubject;
};