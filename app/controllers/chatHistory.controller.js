const db = require("../models");
const Op = db.Sequelize.Op;
const { where, cast, col } = require('sequelize');
var jwt = require("jsonwebtoken");
const dayjs = require('dayjs');
const { SuccessRes, ErrorRes, ErrorCatchRes} = require('../utils/response.util.js')

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
        res.status(200).send(new SuccessRes("Fetching successful."))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}