const { where } = require("sequelize");
const db = require("../models");
const dayjs = require('dayjs');
const Op = db.Sequelize.Op;

const Teacher = db.teacher;
const Subject = db.subject;
const Student = db.student

//########################## CREATE ##########################
exports.createTeacher = async (req, res) => {
    const data = {
        user_id: req.body.user_id ? req.body.user_id : req.user_id,
        teacher_first_name: req.body.teacher_first_name,
        teacher_last_name: req.body.teacher_last_name,
        create_by: req.user_id,
    }
    console.log("create_by " + data.create_by); // ตรวจสอบข้อมูลทั้งหมดใน params
    if (!data.teacher_first_name || !data.teacher_last_name) {
        res.status(400).send({
            message: "Content can not be empty!",
            data: null,
            status_code: 400
        });
        return;
    }

    try {
        const oldTeacher = await Teacher.findOne({
            where: {
                teacher_first_name: data.teacher_first_name,
                teacher_last_name: data.teacher_last_name
            }
        })
        if (oldTeacher) {
            res.status(400).send({
                message: "อาจารย์ซ้ำ",
                data: null,
                status_code: 400
            });
        }
        else {
            const result = await Teacher.create(data)
            res.status(200).send({
                message: "New teacher added successfully",
                data: result,
                status_code: 200
            });
        }
    }
    catch (err) {
        res.status(500).send({
            message: "Error : " + err.message || "Some error occurred while creating the Teacher.",
            data: null,
            status_code: 500
        });
    }
};

//########################## FIND ##########################
exports.findAllTeacher = async (req, res) => {
    try {
        const result = await Teacher.findAll({
            order: [['teacher_id', 'ASC']],
        });
        const formattedResult = result.map(data => {
            data = data.get();
            data.createdAt = dayjs(data.createdAt).format('DD-MM-YYYY เวลา HH:mm:ss น.');
            data.updatedAt = dayjs(data.updatedAt).format('DD-MM-YYYY เวลา HH:mm:ss น.');
            return data;
        });
        res.status(200).send({
            data: formattedResult,
            status_code: 200
        });
    }
    catch (error) {
        res.status(500).send({
            message: "An error occurred: " + error.message,
            data: null,
            status_code: 500
        });
    }
}

exports.findTeacherByTeacherId = async (req, res) => {
    const id = Number(req.params.id);
    if (!id || isNaN((id))) {
        return res.status(400).send({
            message: "Please enter valid number values.",
            data: null,
            status_code: 400
        })
    }
    try {
        const result = await Teacher.findByPk(id);


        if (result) {
            res.status(200).send({
                data: result,
                status_code: 200
            });
        }
        else {
            res.status(404).send({
                message: "This teacher id does not exist.",
                data: null,
                status_code: 404
            })
        }
    }
    catch (err) {
        res.status(500).send({
            message: err.message,
            data: null,
            status_code: 500
        }
        )
    }
}

exports.findTeacherByUserId = async (req, res) => {
    const user_id = req.params.user_id
    if (!user_id || isNaN(user_id) || user_id === 0) {
        return res.status(400).send({
            message: "Please enter valid number values.",
            data: null,
            status_code: 400
        })
    }
    try {
        const result = await Teacher.findOne({
            where: { user_id: user_id },
            // include: [{
            //     model: Subject,
            //     as: "subjects",
            //     attributes: ["subject_id", "subject_name", "credits"],
            //     through: { attributes: [] }
            //     // include: [{
            //     //     model: Student,
            //     //     as: "students",
            //     //     attributes: ["student_id", "student_first_name", "student_last_name", "user_id"],

            //     // }]
            // }]
        })

        if (result) {
            res.status(200).send({
                data: result,
                status_code: 200
            });
        }
        else {
            res.status(404).send({
                message: "This user_id is not registered as a teacher.",
                data: null,
                status_code: 404
            })
        }
    }
    catch (err) {
        res.status(500).send({
            message: err.message,
            data: null,
            status_code: 500
        }
        )
    }
}

exports.findIsTeacherAddThisSubject = async (req, res) => {
    const data = {
        teacher_id: req.body.teacher_id,
        subject_id: req.body.subject_id
    }

    if (data.teacher_id === 0 || !data.subject_id === 0 || isNaN(data.teacher_id) || isNaN(data.subject_id)) {
        return res.status(400).send({
            message: "Please enter numbers.",
            data: null,
            status_code: 400
        })
    }

    try {
        const teacherMixSubject = await Teacher.findOne({
            where: { teacher_id: data.teacher_id },
            include: [{
                model: Subject,
                as: "subjects",
                attributes: ["subject_id", "subject_name", "credits"],
                through: {
                    attributes: [],
                }
            }]
        });

        if (!teacherMixSubject) {
            return res.status(404).send({
                message: "Teacher not found",
                data: null,
                status_code: 404
            });
        }

        const result = teacherMixSubject.toJSON();

        const subject = result.subjects.filter((s) => {
            return s.subject_id === data.subject_id;
        });

        if (subject.length > 0) {
            result.subjects = subject;
            res.status(200).send({
                status: true,
                data: result,
                status_code: 200
            });
        }
        else {
            result.subject = null;
            res.status(200).send({
                message: "This teacher does not have this subject.",
                data: null,
                status_code: 200,
            });
        }
    }
    catch (error) {
        res.status(500).send({
            message: "ERROR : " + error.message,
            data: null,
            status_code: 500
        });
    }
}

//########################## REMOVE ##########################
exports.changeTeacherName = async (req, res) => {
    const data = {
        teacher_id: req.body.teacher_id,
        teacher_first_name: req.body.teacher_first_name,
        teacher_last_name: req.body.teacher_last_name
    }
    if (!data.teacher_id || isNaN((data.teacher_id))) {
        return res.status(400).send({
            message: "Please enter valid id number values.",
            data: null,
            status_code: 400
        })
    }
    else if (!data.teacher_first_name || !data.teacher_last_name) {
        return res.status(400).send({
            message: "Please enter your first name and your last name",
            data: null,
            status_code: 400
        })
    }

    try {
        const findId = await Teacher.findByPk(data.teacher_id)
        if (findId) {
            const data_update = await Teacher.update(data, { where: { teacher_id: data.teacher_id } })
            res.status(200).send({
                message: "Update leaw ka",
                data: data_update,
                status_code: 200
            })
        }
    }
    catch (err) {
        res.status(500).send({
            message: "ERROR : " + err.message,
            data: null,
            status_code: 500

        })
    }
}

//########################## REMOVE ##########################
exports.removeSubjectByTeacher = async (req, res) => {
    const teacher_id = req.params.teacher_id;
    const subject_id = req.params.subject_id;

    if (teacher_id === 0 || subject_id === 0 || isNaN(teacher_id) || isNaN(subject_id)) {
        return res.status(400).send({
            message: "Please enter valid number values.",
            data: null,
            status_code: 400
        });
    }

    try {
        const findIdTeacher = await Teacher.findByPk(teacher_id);
        if (findIdTeacher) {
            const findIdSubject = await Subject.findByPk(subject_id);
            if (findIdSubject) {
                res.status(200).send({
                    message: "Subject removed from teacher.",
                    data: findIdSubject,
                    status_code: 200
                });
                await findIdTeacher.setSubject(null); // Remove the subject from teacher
            }
            else {
                res.status(404).send({
                    message: "This id subject is not found.",
                    data: null,
                    status_code: 404
                });
            }
        }
        else {
            res.status(404).send({
                message: "This id teacher is not found.",
                data: null,
                status_code: 404
            });
        }
    }
    catch (err) {
        res.status(500).send({
            message: "ERROR : " + err.message,
            data: null,
            status_code: 500
        });
    }
};

//########################## CHECK ##########################
exports.checkIsTeacherAddThisSubject = async (req, res) => {
    const teacher_id = req.params.teacher_id;
    const subject_id = req.params.subject_id;
    try {
        const teacher = await Teacher.findByPk(teacher_id);
        if (teacher) {
            const subject = await Subject.findByPk(subject_id);
            if (subject) {
                if (teacher.subject_id === subject_id) {
                    return res.status(409).send({
                        message: "You already added this subject.",
                        data: null,
                        status_code: 409
                    });
                }

                res.status(200).send({
                    message: "You can add this subject.",
                    data: null,
                    status_code: 200
                });
            }
            else {
                return res.status(404).send({
                    message: "Subject id is not found!",
                    data: null,
                    status_code: 404
                });
            }
        }
        else {
            return res.status(404).send({
                message: "Teacher id is not found!",
                data: null,
                status_code: 404
            });
        }
    }
    catch (err) {
        res.status(500).send({
            message: "Error : " + err.message,
            data: null,
            status_code: 500
        });
    }
};

//########################## ADD ##########################
exports.addTeachSubject = async (req, res) => {
    const teacher_id = req.params.teacher_id;
    const subject_id = req.params.subject_id;
    try {
        if (!teacher_id || !subject_id || teacher_id === 0 || subject_id === 0) {
            return res.status(400).send({
                message: "Content can not be empty!",
                data: null,
                status_code: 400
            });
        }
        const teacher = await Teacher.findByPk(teacher_id);
        if (!teacher) {
            return res.status(404).send({
                message: "Teacher id is not found!",
                data: null,
                status_code: 404
            });
        }

        const subject = await Subject.findByPk(subject_id);
        if (!subject) {
            return res.status(404).send({
                message: "Subject id is not found!",
                data: null,
                status_code: 404
            });
        }

        if (teacher.subject_id === subject_id) {
            return res.status(400).send({
                message: "You already add this subject.",
                data: null,
                status_code: 400
            });
        }

        teacher.subject_id = subject_id;
        const result = await teacher.save(); // Save the new data back to the database

        res.status(200).send({
            message: "Teacher add subject successfully.",
            data: result,
            status_code: 200
        });
    }
    catch (err) {
        res.status(500).send({
            message: "Error : " + err.message,
            data: null,
            status_code: 500
        });
    }
};

//########################## DELETE ##########################
exports.deleteTeacherById = async (req, res) => {
    const id = req.params.id
    try {
        if (!id) {
            return res.status(400).send({
                message: `Enter Teacher id.`,
                data: null,
                status_code: 400
            });
        }

        const teacher = await Teacher.findByPk(id);
        if (!teacher) {
            return res.status(404).send({
                message: `Teacher id=${id} not found`,
                data: null,
                status_code: 404
            });
        }

        const result = await Teacher.destroy({ where: { teacher_id: id } })
        res.status(200).send({
            message: `Teacher id : ${id} deleted successfully`,
            data: result,
            status_code: 200
        })

    }
    catch (err) {
        res.status(500).send({
            message: "Error : " + err.message,
            data: null,
            status_code: 500
        })
    }
}