
const db = require("../models");
const Op = db.Sequelize.Op;
const { where, cast, col } = require('sequelize');

var jwt = require("jsonwebtoken");
const UpdateStudent = db.updateStudent;
const dayjs = require('dayjs');

const searchUtil = require('../utils/search.util.js');
const semesterService = require('../services/semester.service.js');
const User = db.user;
const Role = db.role;
const Student = db.student;
const Subject = db.subject;
const SubjectStudent = db.subject_student
const TermHistory = db.termHistory;
const Teacher = db.teacher
const GradeTerm = db.gradeTerm

//########################## CREATE ##########################
exports.createStudent = async (req, res) => {
    if (!req.body.student_first_name && !req.body.student_last_name) {
        res.status(400).send({
            message: "Content can not be empty!",
            data: null,
            status_code: 400
        });
        return;
    }
    try {
        const term = await semesterService.checkSemester()
        if (!term || !term.activeTerm) {
            return res.status(200).send({
                isOpen: false,
                message: "Do not has active semester.",
                data: null,
                status_code: 200
            });
        }
        const student = {
            user_id: req.body.user_id ? req.body.user_id : req.user_id,
            create_by: req.user_id,
            student_first_name: req.body.student_first_name,
            student_last_name: req.body.student_last_name,
            term_id: term.activeTerm.term_id
        };

        if (!student.user_id || isNaN(student.user_id) /*เมือ่ไม่ใข่ตัวเลข*/) {
            return res.status(400).send({
                message: "Please enter valid id number values.",
                data: null,
                status_code: 400
            });
        }
        if (!student.student_first_name || !student.student_last_name) {
            return res.status(400).send({
                message: "กรุณากรอกข้อมูลให้ครบ",
                data: result,
                status_code: 400
            });
        }
        const user = await User.findOne({
            where: { user_id: student.user_id },
            include: [{
                model: Role,
                as: "roles",
                attributes: ["name"],
                through: { attributes: [] }
            }]
        });

        if (!user) {
            return res.status(404).send({
                message: "Username is not found.",
                data: null,
                status_code: 404
            })
        }
        else if (user?.roles.find((r) => r.name !== "student")) {
            return res.status(404).send({
                message: "This user is not student role.",
                data: null,
                status_code: 404
            })
        }

        const oldStudent = await Student.findOne({
            where: {
                student_first_name: student.student_first_name,
                student_last_name: student.student_last_name
            }
        })
        if (oldStudent) {
            res.status(400).send({
                message: "นักเรียนซ้ำ",
                data: null,
                status_code: 400
            });
        }
        else {
            const result = await Student.create(student)
            console.log("student_id :", result.student_id)
            user.student_id = result.student_id
            await user.save();
            res.status(200).send({
                message: "New student added successfully",
                data: result,
                status_code: 200
            });

            //create updateStudent Table
            update_data = {
                update_by: result.username,
                update_type: 'CREATE',
                student_id: result.student_id,
                new_data: student.student_first_name + " " + student.student_last_name,
                old_data: null
            }

            try {
                await UpdateStudent.create(update_data);
                console.log("Update Data", update_data);
            } catch (err) {
                console.error("Error inserting into UpdateStudent:", err);
            }
        }

    }
    catch (err) {
        res.status(500).send({
            message: "Error : " + err.message || "Some error occurred while creating the Student.",
            data: null,
            status_code: 500
        });
    }
};

//########################## FIND ##########################
exports.findAll = async (req, res) => {
    try {
        const result = await Student.findAll({
            order: [['student_id', 'ASC']],
            // attributes: ["student_id", "student_first_name", "student_last_name", "create_by", "user_id", "createdAt"],
            include: [{
                model: Subject,
                as: "subjects",
                attributes: ["subject_id", "subject_name", "credits"],
                through: { attributes: [] },
            }]

        })
        const formattedResult = result.map(data => {
            data = data.get();
            data.createdAt = dayjs(data.createdAt).format('DD-MM-YYYY');
            data.updatedAt = dayjs(data.updatedAt).format('DD-MM-YYYY');
            return data;
        });

        res.status(200).send({
            data: formattedResult,
            status_code: 200
        }
        )
    }
    catch (error) {
        res.status(500).send({
            message: "An error occurred: " + error.message,
            data: null,
            status_code: 500
        });
    }
}

exports.findStudentByStudentId = async (req, res) => {
    const id = req.params.id?.trim()
    if (!id || id.trim() === '' || isNaN((id)) || id === 0) {
        return res.status(400).send({
            message: "Please enter valid number values.",
            data: null,
            status_code: 400
        })
    }
    try {
        const result = await Student.findByPk(id, {
            attributes: ["student_id", "student_first_name", "student_last_name", "create_by", "user_id"],
            include: [{
                model: Subject,
                as: "subjects",
                attributes: ["subject_id", "subject_name", "credits"],
                through: { attributes: [] },
                include: [{
                    model: Teacher,
                    as: "teachers",
                    attributes: ["teacher_id", "teacher_first_name", "teacher_last_name", "user_id"],

                }]
            }]

        })

        if (result) {
            res.status(200).send({
                data: result,
                status_code: 200
            });
        }
        else {
            res.status(404).send({
                message: "This user_id is not registered as a student.",
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

exports.findStudentByUserId = async (req, res) => {
    const user_id = req.params.user_id
    if (!user_id || isNaN(user_id) || user_id === 0) {
        return res.status(400).send({
            message: "Please enter valid number values.",
            data: null,
            status_code: 400
        })
    }
    try {
        const result = await Student.findOne({
            where: { user_id: user_id },
            attributes: ["student_id", "student_first_name", "student_last_name", "create_by", "user_id"],
            include: [{
                model: Subject,
                as: "subjects",
                attributes: ["subject_id", "subject_name", "credits"],
                through: { attributes: [] },
                include: [{
                    model: Teacher,
                    as: "teachers",
                    attributes: ["teacher_id","teacher_first_name","teacher_last_name"],
                }]
            }]
        })

        if (result) {
            res.status(200).send({
                data: result,
                status_code: 200
            });
        }
        else {
            res.status(404).send({
                message: "This user_id is not registered as a student.",
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

exports.findGpaStudent = async (req, res) => {
    const id = req.params.id
    if (!id || isNaN(id) || id === 0) {
        return res.status(400).send({
            message: "Please enter valid number values.",
            data: null,
            status_code: 400
        })
    }
    try {
        const grade = await GradeTerm.findOne({ where: { student_id: id } })
        res.status(200).send({
            message: "Fetching successfully.",
            data: grade,
            status_code: 200
        })
    }
    catch (err) {
        res.status(500).send({
            message: "Error" + err.message,
            data: null,
            status_code: 500
        })
    }
}

//########################## SEARCH ##########################

exports.searchStudent = async (req, res) => {
    const data = {
        searchType: req.body.searchType,
        searchData: req.body.searchData,
        sort: req.body.sort
    }

    const cols_name = ['student_id', 'create_by', 'user_id', 'createdAt', 'student_first_name', 'student_last_name']

    let searchCondition = {}

    if (data.searchData && data.searchType && cols_name.includes(data.searchType)) {
        searchCondition = searchUtil.setSearchCondition(data.searchType, data.searchData)
    }

    try {
        if (!data.searchData) {
            const student = await Student.findAll({ order: [['student_id', `${data.sort}`]] });

            const formattedResult = student.map(data => {
                data = data.get();
                data.createdAt = dayjs(data.createdAt).format('DD-MM-YYYY');
                data.updatedAt = dayjs(data.updatedAt).format('DD-MM-YYYY');
                return data;
            });
            res.status(200).send({
                data: formattedResult,
                status_code: 200
            });
            return
        }

        const student = await Student.findAll({
            where: searchCondition,
            order: [['student_id', `${data.sort}`]]
        });
        if (!student) {
            return res.status(404).send({
                message: "No data.",
                data: null,
                status_code: 404
            })
        }
        const formattedResult = student.map(data => {
            data = data.get();
            data.createdAt = dayjs(data.createdAt).format('DD-MM-YYYY');
            data.updatedAt = dayjs(data.updatedAt).format('DD-MM-YYYY');
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
exports.changeStudentName = async (req, res) => {
    const data = {
        student_id: req.body.student_id,
        student_first_name: req.body.student_first_name,
        student_last_name: req.body.student_last_name
    }
    if (!data.student_id || isNaN((data.student_id))) {
        return res.status(400).send({
            message: "Please enter valid id number values.",
            data: null,
            status_code: 400
        })
    }
    else if (!data.student_first_name || !data.student_last_name) {
        return res.status(400).send({
            message: "Please enter your first name and your last name",
            data: null,
            status_code: 400
        })
    }

    try {
        const findId = await Student.findByPk(data.student_id)
        if (findId) {
            const data_update = await Student.update(data, { where: { student_id: data.student_id } })
            res.status(200).send({
                message: "Update leaw ka",
                data: data_update,
                status_code: 200
            })

            //update updateStudent Table
            update_data = {
                update_by: req.username,
                update_type: 'UPDATE',
                student_id: findId.student_id,
                new_data: data.student_first_name + " " + data.student_last_name,
                old_data: findId.student_first_name + " " + findId.student_last_name
            }

            try {
                await UpdateStudent.create(update_data);
                console.log("Update Data", update_data);
            } catch (err) {
                console.error("Error updating into UpdateStudent:", err);
            }
        }
        else {
            res.status(404).send({
                message: "This id is not found.",
                data: null,
                status_code: 404
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

//########################## ADD ##########################
exports.addSubjectByStudent = async (req, res) => {
    const id_stud = req.params.student_id
    const id_sub = req.params.subject_id

    if (id_stud === 0 || id_sub === 0 || isNaN(id_stud) || isNaN(id_sub)) {
        return res.status(400).send({
            message: "Please enter valid number values.",
            data: null,
            status_code: 400
        })
    }
    try {
        //เช็คว่ามี id studentมั้ย
        const student = await Student.findByPk(id_stud)
        if (!student) {
            return res.status(404).send({
                message: "This id student is not found.",
                data: null,
                status_code: 404
            })
        }

        const subject = await Subject.findByPk(id_sub, {
            include: {
                model: Student,
                as: "students"
            }
        })
        if (!subject) {
            return res.status(404).send({
                message: "This id subject is not found.",
                data: null,
                status_code: 404
            })
        }
        //เช็คว่าเคยลงทะเบียนยัง
        const checkAdd = await SubjectStudent.findOne({
            where: {
                student_id: id_stud,
                subject_id: id_sub
            }
        })
        if (checkAdd) {
            return res.status(409).send({
                message: "You have already enrolled in this subject.",
                data: null,
                status_code: 409
            })
        }


        //นับว่าเต็มยัง
        const count_sub_stud = await SubjectStudent.findAll({
            where: {
                subject_id: id_sub
            }
        });
        // const json_data = to(count_sub_stud.toJSON())
        // const json_data = JSON.parse(JSON.stringify(count_sub_stud))
        // console.log(json_data)

        //เช็คจำนวนของนิสิต
        if (count_sub_stud.length >= 5) {
            return res.status(409).send({
                message: "This subject is full.",
                data: null,
                status_code: 409
            })
        }
        else {
            //เพิ่มวิชา
            await student.addSubject(subject)
            //เช็คเปืดลงทะเบียนยัง
            const semester_state = await semesterService.checkSemester()
            if (semester_state) {
                await TermHistory.create({
                    term_id: semester_state.activeTerm.term_id,
                    student_id: id_stud,
                    subject_id: id_sub,
                });
                res.status(200).send({
                    message: "Add new subject successfully.",
                    data: subject,
                    status_code: 200
                })
            }
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

exports.removeSubjectByStudent = async (req, res) => {
    const id_stud = req.params.student_id
    const id_sub = req.params.subject_id

    if (id_stud === 0 || id_sub === 0 || isNaN(id_stud) || isNaN(id_sub)) {
        return res.status(400).send({
            message: "Please enter valid number values.",
            data: null,
            status_code: 400
        })
    }

    try {
        const findIdStudent = await Student.findByPk(id_stud)
        // console.log("Student id is : "+add.student_id)
        if (findIdStudent) {
            const findIdSubject = await Subject.findByPk(id_sub)
            // console.log("Subject id is " + add.subject_id)
            if (findIdSubject) {
                res.status(200).send({
                    message: "Subject removed from student.",
                    data: findIdSubject,
                    status_code: 200
                })

                await TermHistory.destroy({
                    where: {
                        student_id: id_stud,
                        subject_id: id_sub
                    }
                });
                await findIdStudent.removeSubject(findIdSubject)

            }
            else {
                res.status(404).send({
                    message: "This id subject is not found.",
                    data: null,
                    status_code: 404
                })
            }
        }
        else {
            res.status(404).send({
                message: "This id student is not found.",
                data: null,
                status_code: 404
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


//########################## CHECK ##########################
exports.checkIsStudentAddThisSubject = async (req, res) => {
    const id_stud = Number(req.params.student_id)
    const id_sub = Number(req.params.subject_id)

    if (id_stud === 0 || id_sub === 0 || isNaN(id_stud) || isNaN(id_sub)) {
        return res.status(400).send({
            message: "Please enter valid number values.",
            data: null,
            status_code: 400
        })
    }

    try {
        const studentMixSubject = await Student.findOne(
            {
                where: { student_id: id_stud },
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

        if (!studentMixSubject) {
            return res.status(404).send({
                message: "Student not found",
                data: null,
                status_code: 404
            });
        }

        let result = studentMixSubject.toJSON()
        // console.log("studentMixSubject --> ", studentMixSubject)
        // console.log("result -->  ", result)


        let subject = result.subjects.filter((s) => {
            return s.subject_id === id_sub
        })

        //แปลงจากobject --> JSON --> 
        //JSON.stringify Output --> { name: 'John', age: 30 }
        //JSON.parse Output --> '{"name":"John","age":30}'
        // console.log('last result --> ', JSON.parse(JSON.stringify(result)));

        //ถ้าลงทะเบียนเเล้ว
        if (subject.length > 0) {
            result.subjects = subject
            res.status(409).send({
                status: true,
                data: result,
                status_code: 409
            })
        }
        else {
            result.subject = null
            res.status(200).send({
                message: "This student does not has this subject.",
                data: null,
                status_code: 200,
            })
        }
    }
    catch (error) {
        res.status(500).send({
            message: "ERROR : " + error.message,
            data: null,
            status_code: 500
        })
    }
}

//########################## DELETE ##########################
exports.deleteStudentById = async (req, res) => {
    const id = req.params.id
    try {
        if (!id) {
            return res.status(400).send({
                message: `Enter student id.`,
                data: null,
                status_code: 400
            });
        }

        const student = await Student.findByPk(id);
        if (!student) {
            return res.status(404).send({
                message: `Student id=${id} not found`,
                data: null,
                status_code: 404
            });
        }

        //delete UpdateStudent Table
        update_data = {
            update_by: req.username,
            update_type: 'DELETE',
            student_id: req.params.id,
            new_data: null,
            old_data: null
        }

        try {
            await UpdateStudent.create(update_data);
            console.log("Update Data", update_data);
        } catch (err) {
            console.error("Error deleting into UpdateStudent:", err);
        }

        const result = await Student.destroy({ where: { student_id: id } })
        res.status(200).send({
            message: `Student id : ${id} deleted successfully`,
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