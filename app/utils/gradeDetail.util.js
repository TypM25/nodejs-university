const db = require('../models');
const Op = db.Sequelize.Op;

const Student = db.student
const Subject = db.subject
const Semester = db.semester

exports.checkDataNotfound = async (student_id, subject_id, term_id, score) => {
    let canOperated = true
    let status_code = 200;
    let set_message = ""

    if (
        student_id == null ||
        subject_id == null ||
        term_id == null ||
        score == null) {
        return {
            canOperated: false,
            status_code: 400,
            set_message: "Content is empty.",
        };
    }


    else if (!Number.isInteger(Number(student_id)) ||
        !Number.isInteger(Number(subject_id)) ||
        !Number.isInteger(Number(term_id)) ||
        !Number.isInteger(Number(score))
    ) {
        let data = "";
        if (!Number.isInteger(Number(student_id))) {
            data = "Student id";
        } else if (!Number.isInteger(Number(subject_id))) {
            data = "Teacher id";
        } else if (!Number.isInteger(Number(term_id))) {
            data = "Term id";
        }
        else if (!Number.isInteger(Number(score))) {
            data = "Score";
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
        Subject.findByPk(subject_id),
        Semester.findByPk(term_id),
    ]);

    if (!student || !teacher || !term) {
        var data = ""
        if (!student) {
            data = "Student"
        }
        else if (!teacher) {
            data = "Subject"
        }
        else if (!term) {
            data = "Term"
        }
        return {
            canOperated: false,
            status_code: 404,
            set_message: `${data} id is not found.`
        }
    }

    return {
        canOperated,
        status_code,
        set_message,
    }
}
