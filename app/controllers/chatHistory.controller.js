const db = require("../models");
const Op = db.Sequelize.Op;
const { where, cast, col } = require('sequelize');
var jwt = require("jsonwebtoken");
const dayjs = require('dayjs');

const ChatHistory = db.chatHistory

//########################## FIND ##########################
exports.findChatHistory = async (req, res) => {
    const user1 = req.body.user1
    const user2 = req.body.user2
    try {
        const chat = await ChatHistory.findAll({
            where: {
                // ตัวอย่าง pseudocode ใน controller หรือ route
                user_id1: Math.min(user1, user2),
                user_id2: Math.max(user1, user2),
            },
            order: [['send_time', 'ASC']] // เรียงตามเวลาที่ส่ง
        })
      
        res.status(200).send({
            message: "Fetching successfully.",
            data: chat,
            status_code: 200
        })

    }
    catch (err) {
        res.status(500).send({
            message: "Error : " + err.message,
            data: null,
            status_code: 500
        });
    }
}