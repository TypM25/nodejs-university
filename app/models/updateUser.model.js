module.exports = (sequelize, Sequelize) => {
    const UpdateUser = sequelize.define("updateUser", {
        //updated_by 
        //username 
        update_type: {
            type: Sequelize.STRING,
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

    return UpdateUser;
};