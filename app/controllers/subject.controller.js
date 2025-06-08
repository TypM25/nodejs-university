// const { where } = require("sequelize");
const db = require("../models");
const dayjs = require('dayjs');
const { where, cast, col } = require('sequelize');
const { SuccessRes, ErrorRes, ErrorCatchRes } = require('../utils/response.util.js')

const searchUtil = require('../utils/search.util.js');

const Subject = db.subject;
const Op = db.Sequelize.Op;
const UpdateSubject = db.updateSubject
const Teacher = db.teacher
const Student = db.student
const GradeDetail = db.gradeDetail

//########################## CREATE ##########################
exports.createSubject = async (req, res) => {
    if (!req.body.subject_name || !req.body.credits)
        return res.status(409).send(new ErrorRes("Content can not be empty!", 409))


    const subject = {
        subject_name: req.body.subject_name.toLowerCase(),
        credits: req.body.credits,
        create_by: req.user_id
    };

    try {
        const oldSubject = await Subject.findOne({ where: { subject_name: subject.subject_name } })
        if (oldSubject) {
            res.status(400).send(new ErrorRes("วิชาซ้ำจ้า", 400))
        }
        else {
            const result = await Subject.create(subject)
            res.status(200).send(new SuccessRes("New subject added successfully", result))

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
            } catch (error) {
                console.error("Error inserting into UpdateSubject.", err);
            }
        }
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
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
            data.createdAt = dayjs(data.createdAt).format('DD-MM-YYYY');
            data.updatedAt = dayjs(data.updatedAt).format('DD-MM-YYYY');
            return data;
        });

        res.status(200).send(new SuccessRes("Fetching successful", formattedResult))

    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

exports.findSubjectById = async (req, res) => {
    const id = req.params.id
    if (id === 0 || !id || isNaN((id))) {
        return res.status(400).send(new ErrorRes("Please enter number.", 400))
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
        if (result) return res.status(200).send(new SuccessRes("Fetching successful", result))

        res.status(404).send(new ErrorRes("This subject id is not found.", 404))

    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
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
            order: [['subject_id', 'ASC']]
        })
        if (!result || result.length === 0) return res.status(200).send(new SuccessRes("Empty."))
        res.status(200).send(new SuccessRes("Fetching successfully.", result))
    }

    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
};

//########################## SEARCH ##########################
exports.searchSubject = async (req, res) => {
    const data = {
        searchType: req.body.searchType,
        searchData: req.body.searchData,
        sort: req.body.sort
    }

    const cols_name = ['subject_id', 'create_by', 'createdAt', 'subject_name'];


    let searchCondition = {}

    if (data.searchData && data.searchType && cols_name.includes(data.searchType)) {
        searchCondition = searchUtil.setSearchCondition(data.searchType, data.searchData)
    }


    try {
        if (!data.searchData) {
            const subject = await Subject.findAll({ order: [['subject_id', `${data.sort}`]] });
            const formattedResult = subject.map(data => {
                data = data.get();
                data.createdAt = dayjs(data.createdAt).format('DD-MM-YYYY');
                data.updatedAt = dayjs(data.updatedAt).format('DD-MM-YYYY');
                return data;
            });

            res.status(200).send(new SuccessRes("Fetching successfully.", formattedResult))
            return
        }

        const subject = await Subject.findAll({
            where: searchCondition,
            order: [['subject_id', `${data.sort}`]]
        });
        if (!subject) return res.status(404).send(new ErrorRes("No data.", 404))


        const formattedResult = subject.map(data => {
            data = data.get();
            data.createdAt = dayjs(data.createdAt).format('DD-MM-YYYY');
            data.updatedAt = dayjs(data.updatedAt).format('DD-MM-YYYY');
            return data;
        });

        res.status(200).send(new SuccessRes("Fetching successfully.", formattedResult))

    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}



//########################## UPDATE ##########################
exports.editSubject = async (req, res) => {
    const id = req.params.id
    try {
        if (!id) return res.status(400).send(new ErrorRes(`Enter subject id.`, 400))

        const findId = await Subject.findByPk(id)
        if (!findId) return res.status(404).send(new ErrorRes("Can not find this subject id", 404))


        await Subject.update(req.body, { where: { subject_id: id } })
        console.log(req.body)

        res.status(200).send(new SuccessRes("Subject was updated successfully!", req.body))

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
        } catch (error) {
            console.error("Error deleting into UpdateSubject.", err);
        }
    }
    catch {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

//########################## DELETE ##########################
exports.deleteAllSubject = async (req, res) => {
    try {
        const result = await Subject.findAll({
            order: [['subject_id', 'ASC']]
        })
        console.log("result is delete all subject : " + result)
        if (result.length === 0) return res.status(404).send(new ErrorRes("Empty subject.", 404))

        await Subject.destroy({
            where: {}
        })

        res.status(200).send(new SuccessRes("Subjects were deleted successfully!"))

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
        } catch (error) {
            console.error("Error deleting all into UpdateSubject.", err);
        }
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

exports.deleteSubject = async (req, res) => {
    const id = req.params.id
    try {
        if (!id) return res.status(400).send(new ErrorRes(`Enter subject id.`, 400))

        const subject = await Subject.findByPk(id);
        if (!subject) return res.status(404).send(new ErrorRes(`Subject id=${id} not found`, 404))

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
        } catch (error) {
            console.error("Error deleting into UpdateSubject.", err);
        }

        const result = Subject.destroy({ where: { subject_id: id } })
        res.status(200).send(new SuccessRes(`Subject id= ${id} deleted successfully`, result))

    }
    catch (error) {
         res.status(500).send(new ErrorCatchRes(error))
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
//     catch (error) {
//         res.status(500).send({
//             message: "Error : " + error.message,
//             data: null,
//             status_code: 500
//         });
//     }

// }
