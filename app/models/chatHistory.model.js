module.exports = (sequelize, Sequelize) => {
    const ChatHistory = sequelize.define("chatHistory", {
        user_id1: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        user_id2: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        sender_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        message: {
            type: Sequelize.STRING,
            allowNull: false
        },
        send_time: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,  // กำหนดค่าเริ่มต้นเป็นเวลาปัจจุบันตอนบันทึก
        }
    }, {
        timestamps: false,
        indexes: [
            {
                unique: false,
                fields: ['user_id1', 'user_id2']
            }
        ]
    });

    return ChatHistory;
};
