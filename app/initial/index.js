// รวม initial data ทุกตัวไว้ที่เดียว เรียกจาก server.js ตอน sync database ทุกครั้งที่ deploy app
const db = require("../models");
const roles = require("./roles.data.js");
const questions = require("./questions.data.js");

module.exports = async function initial() {
    for (const name of roles) {
        await db.role.findOrCreate({ where: { name } });
    }
    for (const q of questions) {
        await db.question.findOrCreate({ where: { question_name: q.question_name }, defaults: q });
    }
};
