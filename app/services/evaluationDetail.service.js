const db = require('../models');
const Op = db.Sequelize.Op;

const Student = db.student
const Teacher = db.teacher
const Semester = db.semester
const Question = db.question

//เช็คว่าinputDataตัวไหนไม่มีในDB
exports.checkDataNotfound = async (student_id, teacher_id, term_id, question_id) => {
    let canOperated = false
    let status_code;
    let set_message = ""

    if (!student_id || !teacher_id || !term_id || !question_id) {
        return {
            canOperated: false,
            status_code: 400,
            set_message: "Content is empty.",
        }
    }

     // ตรวจสอบตัวเลข
    else if (!Number.isInteger(Number(student_id)) || !Number.isInteger(Number(teacher_id)) 
        || !Number.isInteger(Number(term_id)) || !Number.isInteger(Number(question_id)) ) {
        let data = "";
        if (!Number.isInteger(Number(student_id))) {
            data = "Student id";
        } else if (!Number.isInteger(Number(teacher_id))) {
            data = "Teacher id";
        } else if (!Number.isInteger(Number(term_id))) {
            data = "Term id";
        }
        else if (!Number.isInteger(Number(question_id))) {
            data = "Question id";
        }
        return {
            canOperated: false,
            status_code: 400,
            set_message: `${data} is not number.`,
        };
    }
 
    const [student, teacher, term, question] = await Promise.all([
        Student.findByPk(student_id),
        Teacher.findByPk(teacher_id),
        Semester.findByPk(term_id),
        Question.findByPk(question_id),
     
    ]);

    if (!student || !teacher || !term || !question) {
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
        else if (!question) {
            data = "Term"
        }
        canOperated = false
        status_code = 404
        set_message = `${data} is not found.`
    }
    else {
        canOperated = true
        status_code = 200
    }
    return {
        canOperated,
        status_code,
        set_message,
    }
}