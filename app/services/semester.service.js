const db = require('../models');
const Semester = db.semester;
const Op = db.Sequelize.Op;

exports.checkSemester = async () => {
    const now = new Date();
    const activeTerm = await Semester.findOne({
        where: {
            start_date: { [Op.lte]: now },
            end_date: { [Op.gte]: now }
        }
    });
    // ส่งค่าผลลัพธ์นี้กลับ ไปให้ controller ที่เรียกใช้
    return activeTerm
}