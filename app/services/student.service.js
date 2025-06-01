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
                            // where: { teacher_id: teacher_id },
                            attributes: ["teacher_id", "teacher_first_name", "teacher_last_name"]
                        }
                    ]
                }
            ]
        }
    )
    //ถ้านิสิตไม่มีวิชาที่ลทบ.
    if (result.subjects.length === 0) {
        return {
            canOperated: false,
            status_code: 400,
            set_message: "This student is not enroll any subject."
        };
    }
    //หาidของอาจารย์ทั้งหมด
    const get_teacher_id = result.subjects.flatMap(sub => sub.teachers.map(teacher => teacher.teacher_id))

    //เช็คว่าidอาจารที่inputมามีกับที่นิสิตเรียนมั้ย
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

//เช็คว่านิสิตคนนี้ลทบ.วิชานี้มั้ย
exports.checkIsStudentAddThisSubject = async (student_id, subject_id) => {
    const student = await Student.findOne(
        {
            where: { student_id: student_id },
            include: [{
                model: Subject,
                as: "subjects",
                attributes: ["subject_id", "subject_name", "credits"],
                where: { subject_id },
                through: {
                    attributes: [],
                }
            }]
        },
    )

    //ไม่เจอนิสิต
    if (!student) {
        return {
            status_code: 404,
            set_message: "Student not found"
        }
    }
    //ยังไม่ลงวิชาอะไรเลย
    if (student.subjects.length === 0) {
        return {
            status_code: 404,
            set_message: "This student not enroll any subjects."
        }
    }
    //ลทบ.วิชานี้เเล้ว
    return {
        status_code: 200,
      set_message: "This student already enrolled this subject."
    }



    //ถ้าเขียนเเบบไม่ใช้where
    // const subject = student.subjects.flatMap(s => s.subject_id)
    // console.log(subject)

    // //ถ้าไม่เจอวิชา
    // if (subject.length === 0) {
    //     return {
    //         status_code: 404,
    //         set_message: "This student not enroll any subjects."
    //     }
    // }
    // if (subject.includes(subject_id)) {
    //     return {
    //         status_code: 200,
    //         set_message: "This student already enroll subject.",
    //     }
    // }
    // }
}