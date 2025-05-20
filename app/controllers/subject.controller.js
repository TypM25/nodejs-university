// const { where } = require("sequelize");
const db = require("../models");
const dayjs = require('dayjs');
const { where, cast, col } = require('sequelize');

const Subject = db.subject;
const Op = db.Sequelize.Op;
const UpdateSubject = db.updateSubject
const Teacher = db.teacher
const Student = db.student
const GradeDetail = db.gradeDetail

//########################## CREATE ##########################
exports.createSubject = async (req, res) => {
    if (!req.body.subject_name || !req.body.credits) {
        res.status(400).send({
            message: "Content can not be empty!",
            data: null,
            status_code: 400
        });
        return;
    }

    const subject = {
        subject_name: req.body.subject_name.toLowerCase(),
        credits: req.body.credits,
        create_by: req.user_id
    };

    try {
        const oldSubject = await Subject.findOne({ where: { subject_name: subject.subject_name } })
        if (oldSubject) {
            res.status(400).send({
                message: "วิชาซ้ำจ้า",
                data: null,
                status_code: 400
            });
        }
        else {
            const result = await Subject.create(subject)
            res.status(200).send({
                message: "New subject added successfully",
                data: result,
                status_code: 200
            });
            //update UpdateSubject Table
            update_data = {
                update_by: req.username,
                update_type: 'CREATE',
                subject_id: result.subject_id,
                new_data: result.subject_name,
                old_data: null
            }

            try {
                await UpdateSubject.create(update_data);
                console.log("Update Data", update_data);
            } catch (err) {
                console.error("Error inserting into UpdateSubject.", err);
            }
        }
    }
    catch (err) {
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the Subject.",
            data: null,
            status_code: 500
        });
    }
};

//########################## FIND ##########################
exports.findAllSubject = async (req, res) => {
    try {
        const result = await Subject.findAll({
            order: [['subject_id', 'ASC']],
            include: [
                {
                    model: Teacher,
                    attributes: ["teacher_id", "teacher_first_name", "teacher_last_name"]
                }
            ]

        })
        const formattedResult = result.map(data => {
            data = data.get();
            data.createdAt = dayjs(data.createdAt).format('DD-MM-YYYY เวลา HH:mm:ss น.');
            data.updatedAt = dayjs(data.updatedAt).format('DD-MM-YYYY เวลา HH:mm:ss น.');
            return data;
        });

        res.status(200).send(
            {
                data: formattedResult,
                status_code: 200
            }
        )

    }
    catch (err) {
        res.status(500).send({
            message: "Error : " + err.message,
            data: null,
            status_code: 500
        });
    }
}

exports.findSubjectById = async (req, res) => {
    const id = req.params.id
    if (id === 0 || !id || isNaN((id))) {
        return res.status(400).send({
            message: "Please enter number.",
            data: null,
            status_code: 400
        })
    }

    try {
        const result = await Subject.findByPk(id, {
            include: [
                {
                    model: Teacher,
                    as: "teachers",
                    attributes: ["teacher_id", "teacher_first_name", "teacher_last_name", "user_id"],
                },
                {
                    model: Student,
                    as: "students",
                    attributes: ["student_id", "student_first_name", "student_last_name", "user_id"],
                    through: {
                        attributes: [],
                    },
                    include: [
                        {
                            model: GradeDetail,
                            as: "gradeDetails",
                            where: { subject_id: id },
                            required: false, //เพื่อให้ว่านิสิตที่ยังไม่มีเกรดไม่หายไป
                            attributes: ["grade", "score"]

                        }
                    ]
                }
            ]
        })
        if (result) {
            res.status(200).send({
                data: result,
                status_code: 200
            });
        }
        else {
            res.status(404).send({
                message: "This subject id is not found.",
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
        })
    }
}

exports.findMultiSubject = async (req, res) => {
    const raw_id = req.body
    const subIds = raw_id.map(data => Number(data.subject_id));

    console.log("user_id : ", subIds)

    try {
        const result = await Subject.findAll({
            where: {
                subject_id: {
                    [Op.in]: subIds
                }
            },
            include: [
                {
                    model: Teacher,
                    as: "teachers",
                    attributes: ["teacher_id", "teacher_first_name", "teacher_last_name", "user_id"],
                },
                {
                    model: Student,
                    as: "students",
                    attributes: ["student_id", "student_first_name", "student_last_name", "user_id"],
                    through: {
                        attributes: [],
                    },
                    include: [
                        {
                            model: GradeDetail,
                            as: "gradeDetails",
                            where: {
                                subject_id: {
                                    [Op.in]: subIds
                                }
                            },
                            required: false, //เพื่อให้ว่านิสิตที่ยังไม่มีเกรดไม่หายไป
                            attributes: ["grade", "score"]

                        }
                    ]
                }
            ],
            order:[['subject_id','ASC']]
        })
        if (!result || result.length === 0) {
            res.status(200).send({
                message: "Empty.",
                data: null,
                status_code: 200
            });
        }
        res.status(200).send({
            message: "Fetching successfully.",
            data: result,
            status_code: 200
        });
    }

    catch (err) {
        res.status(500).send({
            message: "An error occurred: " + err.message,
            data: null,
            status_code: 500
        });
    }
};

//########################## SEARCH ##########################
exports.searchSubject = async (req, res) => {
    const data = {
        searchType: req.body.searchType,
        searchData: req.body.searchData
    }
    let searchCondition = {}
    if (data.searchType === "subject_id") {
        searchCondition = where(
            cast(col('subject_id'), 'TEXT'),
            {
                [Op.iLike]: `%${data.searchData}%`
            }
        );
    }
    else if (data.searchType === "create_by") {
        searchCondition = where(
            cast(col('create_by'), 'TEXT'),
            {
                [Op.iLike]: `%${data.searchData}%`
            }
        );
    }
    else if (data.searchType === "createdAt") {
        searchCondition = where(
            cast(col('createdAt'), 'TEXT'),
            {
                [Op.iLike]: `%${data.searchData}%`
            }
        );
    }
    else if (data.searchType === "subject_name") {
        searchCondition = {
            subject_name: { [Op.iLike]: `%${data.searchData}%` }
        };
    }

    try {
        if (!data.searchData) {
            const subject = await Subject.findAll();
            const formattedResult = subject.map(data => {
                data = data.get();
                data.createdAt = dayjs(data.createdAt).format('DD-MM-YYYY เวลา HH:mm:ss น.');
                data.updatedAt = dayjs(data.updatedAt).format('DD-MM-YYYY เวลา HH:mm:ss น.');
                return data;
            });
            res.status(200).send({
                data: formattedResult,
                status_code: 200
            })
            return
        }

        const subject = await Subject.findAll({
            where: searchCondition
        });
        if (!subject) {
            return res.status(404).send({
                message: "No data.",
                data: null,
                status_code: 404
            })
        }

        const formattedResult = subject.map(data => {
            data = data.get();
            data.createdAt = dayjs(data.createdAt).format('DD-MM-YYYY เวลา HH:mm:ss น.');
            data.updatedAt = dayjs(data.updatedAt).format('DD-MM-YYYY เวลา HH:mm:ss น.');
            return data;
        });
        res.status(200).send({
            data: formattedResult,
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



//########################## UPDATE ##########################
exports.editSubject = async (req, res) => {
    const id = req.params.id
    try {
        if (!id) {
            return res.status(400).send({
                message: `Enter subject id.`,
                data: null,
                status_code: 400
            });
        }

        const findId = await Subject.findByPk(id)
        if (!findId) {
            return res.status(404).send({
                message: "Can not find this subject id",
                data: null,
                status_code: 404
            })
        }

        await Subject.update(req.body, { where: { subject_id: id } })
        console.log(req.body)
        res.status(200).send({
            message: "Subject was updated successfully!",
            data: req.body,
            status_code: 200
        })

        update_data = {
            update_by: req.username,
            update_type: 'UPDATE',
            subject_id: findId.subject_id,
            new_data: req.body.subject_name,
            old_data: findId.subject_name
        }

        try {
            await UpdateSubject.create(update_data);
            console.log("Update Data", update_data);
        } catch (err) {
            console.error("Error deleting into UpdateSubject.", err);
        }
    }
    catch {
        res.status(500).send({
            message: "Error updating subject with id=" + id,
            data: null,
            status_code: 500
        });
    }
}

//########################## DELETE ##########################
exports.deleteAllSubject = async (req, res) => {
    try {
        const result = await Subject.findAll({
            order: [['subject_id', 'ASC']]
        })
        console.log("result is delete all subject : " + result)
        if (result.length === 0) {
            return res.status(404).send({
                message: "Empty subject.",
                data: null,
                status_code: 404
            });
        }

        await Subject.destroy({
            where: {}
        })
        res.status(200).send({
            message: "Subjects were deleted successfully!",
            data: null,
            status_code: 200
        });

        update_data = {
            update_by: req.username,
            update_type: 'DELETE_ALL',
            subject_id: null,
            new_data: null,
            old_data: null
        }

        try {
            await UpdateSubject.create(update_data);
            console.log("Update Data", update_data);
        } catch (err) {
            console.error("Error deleting all into UpdateSubject.", err);
        }
    }
    catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while removing all Subjects.",
            data: null,
            status_code: 500
        });
    }
}

exports.deleteSubject = async (req, res) => {
    const id = req.params.id
    try {
        if (!id) {
            return res.status(400).send({
                message: `Enter subject id.`,
                data: null,
                status_code: 400
            });
        }

        const subject = await Subject.findByPk(id);
        if (!subject) {
            return res.status(404).send({
                message: `Subject id=${id} not found`,
                data: null,
                status_code: 404
            });
        }

        update_data = {
            update_by: req.username,
            update_type: 'DELETE',
            subject_id: subject.subject_id,
            new_data: null,
            old_data: subject.subject_name
        }

        try {
            await UpdateSubject.create(update_data);
            console.log("Update Data", update_data);
        } catch (err) {
            console.error("Error deleting into UpdateSubject.", err);
        }

        const result = Subject.destroy({ where: { subject_id: id } })
        res.status(200).send({
            message: `Subject id= ${id} deleted successfully`,
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

// exports.addSubjectTeacher = async (req, res) => {
//     const teacher_id = parseInt(req.params.teacher_id)
//     const subject_id = parseInt(req.params.subject_id)

//     try {
//         if (!teacher_id || !subject_id || subject_id === 0 || teacher_id === 0) {
//             return res.status(400).send({
//                 message: "Content can not be empty!",
//                 data: null,
//                 status_code: 400
//             });
//         }
//         const teacher = await Teacher.findByPk(teacher_id)
//         if (!teacher) {
//             return res.status(404).send({
//                 message: "Teacher id is not found!",
//                 data: null,
//                 status_code: 404
//             });
//         }

//         const subject = await Subject.findByPk(subject_id)
//         if (!subject) {
//             return res.status(404).send({
//                 message: "Subject id is not found!",
//                 data: null,
//                 status_code: 404
//             });
//         }

//         // teacher.subject_id = subject_id
//         // const result = await teacher.save(); //เซฟข้อมูลใหม่กลับลงฐานข้อมูล"

//         const result = await teacher.addSubject(subject)
//         res.status(200).send({
//             message: "Add teacher this subject successfully.",
//             data: result,
//             status_code: 200
//         });
//     }
//     catch (err) {
//         res.status(500).send({
//             message: "Error : " + err.message,
//             data: null,
//             status_code: 500
//         });
//     }

// }
