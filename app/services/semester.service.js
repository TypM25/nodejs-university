const db = require('../models');
const Semester = db.semester;
const Op = db.Sequelize.Op;

//เช็คเทอมที่เปิดอยู่ตอนนนี้
exports.checkSemester = async () => {
    let message = ""
    const now = new Date();
    const activeTerm = await Semester.findOne({
        //เงื่อนไข คือ start <= now <= end
        where: {
            start_date: { [Op.lte]: now }, // start_date น้อยกว่า now
            end_date: { [Op.gte]: now } // end_date มากกว่า now
        }
    });


    if (!activeTerm) {
        message = "No active semester period right now." //ไม่มีเทอมที่เปิดตอนนี้
    }
    // ส่งค่าผลลัพธ์นี้กลับ ไปให้ controller ที่เรียกใช้
    return { activeTerm, message }
}