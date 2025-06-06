const db = require('../models');
const Op = db.Sequelize.Op;
const Evaluation = db.evaluation;
const EvaluationDetail = db.evaluationDetail
const Student = db.student
const Teacher = db.teacher
const Semester = db.semester
const Question = db.question

//เช็คว่าinputDataตัวไหนไม่มีในDB
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

    // ตรวจสอบตัวเลข
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

    //เข็คข้อมูลพร้อมกันทั้งหมด
    const [student, teacher, term] = await Promise.all([
        Student.findByPk(student_id),
        Teacher.findByPk(teacher_id),
        Semester.findByPk(term_id),
    ]);

    //เข็คข้อมูลที่ไม่มีในDB
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


//คำนวณคะแนนประเมินอาจารย์ของ1นิสิต เต็ม50
exports.calculateEvaluation = async (student_id, teacher_id, term_id) => {
    let canOperated = true
    const total_evaluation_detail = await EvaluationDetail.findAll({
        where: {
            student_id: student_id,
            teacher_id: teacher_id,
            term_id: term_id
        }
    })
    if (total_evaluation_detail.length !== 10) {
        return {
            canOperated: false,
            sum_score: null
        }
    }
    const sum_score = total_evaluation_detail.reduce((sum, item) => sum + item.score, 0)
    return {
        canOperated,
        sum_score
    }
}
