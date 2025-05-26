const db = require('../models');
const Op = db.Sequelize.Op;

const Student = db.student
const Subject = db.subject
const Teacher = db.teacher
const Semester = db.semester

//เช็คว่านิสิตได้เรียนกับครูคนนี้มั้ย
exports.checkStudentTeacher = async (student_id, teacher_id) => {
    const result = await Student.findByPk(student_id,
        {
            include: [
                {
                    model: Subject,
                    as: 'subjects',
                    attributes: ["subject_id", "subject_name", "credits"],
                    include: [
                        {
                            model: Teacher,
                            as: 'teachers',
                            attributes: ["teacher_id", "teacher_first_name", "teacher_last_name"]
                        }
                    ]
                }
            ]
        }
    )
    // const hasTeacher = result.subjects.some(
    //     sub => sub.teachers && sub.teachers.length > 0
    // );
    //ถ้าไม่มีวิชา
    if (result.subjects.length === 0) {
        return {
            canOperated: false,
            status_code: 400,
            set_message: "This student is not enroll any subject."
        };
    }

    const get_teacher_id = result.subjects
        .map(sub => sub.teachers.map(teacher => teacher.teacher_id))
        .flat();

    const check_teacher_id = get_teacher_id.includes(teacher_id)
    if (!check_teacher_id) {
        return {
            canOperated: false,
            status_code: 400,
            set_message: "This student does not study with this teacher."
        };
    }
    return {
        canOperated: true,
        status_code: 200,
        message: "Student has subjects and assigned teachers."
    };
}


exports.checkIsStudentAddThisSubject = async (student_id, subject_id) => {
    const student = await Student.findOne(
        {
            where: { student_id: student_id },
            include: [{
                model: Subject,
                as: "subjects",
                attributes: ["subject_id", "subject_name", "credits"],
                through: {
                    attributes: [],
                }
            }]
        },
    )

    if (!student) {
        return {
            status_code: 404,
            set_message: "Student not found"
        }
    }

    const subject = student.subjects.flatMap(s => s.subject_id)
    console.log(subject)

    //ถ้าไม่เจอวิชา
    if (subject.length === 0) {
        return {
            status_code: 404,
            set_message: "This student not enroll any subjects."
        }
    }
    if (subject.includes(subject_id)) {
        return {
            status_code: 200,
            set_message: "This student already enroll subject.",
        }
    }
    else {
        return {
            status_code: 404,
            set_message: "This student not enroll this subject.",
        }
    }
}