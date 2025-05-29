const db = require('../models');
const Op = db.Sequelize.Op;

const Student = db.student
const Teacher = db.teacher
const Semester = db.semester


exports.checkDataNotfound = async (student_id, teacher_id, term_id) => {
    let canOperated = true
    let status_code = 200;
    let set_message = ""

    if (!student_id || !teacher_id || !term_id) {
        return {
            canOperated: false,
            status_code: 400,
            set_message: "Content is empty.",
        }
    }

    else if (!Number.isInteger(Number(student_id)) || !Number.isInteger(Number(teacher_id)) || !Number.isInteger(Number(term_id))) {
        let data = "";
        if (!Number.isInteger(Number(student_id))) {
            data = "Student id";
        } else if (!Number.isInteger(Number(teacher_id))) {
            data = "Teacher id";
        } else if (!Number.isInteger(Number(term_id))) {
            data = "Term id";
        }
        return {
            canOperated: false,
            status_code: 400,
            set_message: `${data} is not number.`,
        };
    }

    //เช็คหาข้อมูลไม่เจอ 404
    const [student, teacher, term] = await Promise.all([
        Student.findByPk(student_id),
        Teacher.findByPk(teacher_id),
        Semester.findByPk(term_id),
    ]);

    if (!student || !teacher || !term) {
        var data = ""
        if (!student) {
            data = "Student"
        }
        else if (!teacher) {
            data = "Teacher"
        }
        else if (!term) {
            data = "Term"
        }
        canOperated = false
        status_code = 404
        set_message = `${data} id is not found.`
    }

    return {
        canOperated,
        status_code,
        set_message,
    }
}
