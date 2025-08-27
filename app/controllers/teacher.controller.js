const { where, cast, col } = require('sequelize');
const db = require("../models");
const dayjs = require('dayjs');
const Op = db.Sequelize.Op;
const { SuccessRes, ErrorRes, ErrorCatchRes } = require('../utils/response.util.js')

const searchUtil = require('../utils/search.util.js');
const semesterService = require('../services/semester.service.js');

const Teacher = db.teacher;
const Subject = db.subject;
const Student = db.student
const User = db.user
const Role = db.role
const RatingTeacher = db.teacherRating

//########################## CREATE ##########################
exports.createTeacher = async (req, res) => {
    const data = {
        user_id: req.body.user_id ? req.body.user_id : req.user_id,
        teacher_first_name: req.body.teacher_first_name,
        teacher_last_name: req.body.teacher_last_name,
        create_by: req.user_id,
    }
    if (isNaN(data.user_id))
        return res.status(400).send(new ErrorRes("User id is not a number!", 400))


    if (!data.teacher_first_name || !data.teacher_last_name)
        return res.status(400).send(new ErrorRes("Content can not be empty!", 400))

    try {
        //ตรวจuser
        const user = await User.findOne({
            where: { user_id: data.user_id },
            include: [{
                model: Role,
                as: "roles",
                attributes: ["name"],
                through: { attributes: [] }
            }]
        });

        if (!user) {
            return res.status(404).send(new ErrorRes("Username is not found.", 404))
        }
        else if (user?.roles.find((r) => r.name !== "teacher")) {
            return res.status(404).send(new ErrorRes("This user is not teacher role.", 404))
        }

        const oldTeacher = await Teacher.findOne({
            where: {
                teacher_first_name: data.teacher_first_name,
                teacher_last_name: data.teacher_last_name
            }
        })
        if (oldTeacher) {
            res.status(404).send(new ErrorRes("อาจารย์ซ้ำ", 404))
        }



        else {
            const result = await Teacher.create(data)
            res.status(200).send(new SuccessRes("New teacher added successfully", result))
        }
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
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
            data.createdAt = dayjs(data.createdAt).format('DD-MM-YYYY');
            data.updatedAt = dayjs(data.updatedAt).format('DD-MM-YYYY');
            return data;
        });
        res.status(200).send(new SuccessRes("Fetching successfully", formattedResult))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

exports.findTeacherByTeacherId = async (req, res) => {
    const id = Number(req.params.id);
    if (!id || isNaN((id)))
        return res.status(400).send(new ErrorRes("Please enter valid number values.", 400))


    try {
        const { activeTerm } = await semesterService.checkSemester()
        const result = await Teacher.findByPk(id, {
            include: [{
                model: RatingTeacher,
                as: "teacherRating",
                where: { term_id: activeTerm?.term_id },
                attributes: ["term_id", "avg_score", "rating_score"],
            }]
        });


        if (result) return res.status(200).send(new SuccessRes("Fetching successfully", result))

        res.status(404).send(new ErrorRes("This teacher id does not exist.", 404))


    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

exports.findTeacherByUserId = async (req, res) => {
    const user_id = req.params.user_id
    if (!user_id || isNaN(user_id) || user_id === 0)
        return res.status(400).send(new ErrorRes("Please enter valid number values.", 400))

    try {
        const { activeTerm, message } = await semesterService.checkSemester()
        if (!activeTerm) {
            return res.status(404).send(new ErrorRes(message, 404));
        }

        const result = await Teacher.findOne({
            where: { user_id: user_id },
            include: [{
                model: RatingTeacher,
                as: "teacherRating",
                required: false,
                where: { term_id: activeTerm?.term_id },
                attributes: ["term_id", "avg_score", "rating_score"],
            }]
        })
        if (!result) {
            return res.status(404).send(new ErrorRes("This user_id is not registered as a teacher.", 404))
        }

        res.status(200).send(new SuccessRes("Fetching successful", result))

    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

exports.findIsTeacherAddThisSubject = async (req, res) => {
    const data = {
        teacher_id: req.body.teacher_id,
        subject_id: req.body.subject_id
    }

    if (data.teacher_id === 0 || !data.subject_id === 0 || isNaN(data.teacher_id) || isNaN(data.subject_id)) {
        return res.status(400).send(new ErrorRes("Please enter numbers.", 400))
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

        if (!teacherMixSubject)
            return res.status(404).send(new ErrorRes("Teacher not found", 404))


        const result = teacherMixSubject.toJSON();

        const subject = result.subjects.filter((s) => {
            return s.subject_id === data.subject_id;
        });

        if (subject.length > 0) {
            result.subjects = subject;
            const response = new SuccessRes("Fetching successful", result)
            response.status = true
            res.status(200).send(response)
        }
        else {
            result.subject = null;
            res.status(200).send(new SuccessRes("This teacher does not have this subject."))
        }
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

//########################## SEARCH ##########################
exports.searchTeacher = async (req, res) => {
    const data = {
        searchType: req.body.searchType,
        searchData: req.body.searchData,
        sort: req.body.sort
    }

    const cols_name = ['teacher_id', 'teacher_first_name', 'teacher_last_name', 'user_id', 'create_by', 'createdAt'];


    if (data.searchData && data.searchType && cols_name.includes(data.searchType)) {
        searchCondition = searchUtil.setSearchCondition(data.searchType, data.searchData)
    }

    try {
        if (!data.searchData) {
            const result = await Teacher.findAll({ order: [['teacher_id', `${data.sort}`]] })
            const formattedResult = result.map(data => {
                data = data.get();
                data.createdAt = dayjs(data.createdAt).format('DD-MM-YYYY');
                data.updatedAt = dayjs(data.updatedAt).format('DD-MM-YYYY');
                return data;
            });
            return res.status(200).send(new SuccessRes("Fetching successfully.", formattedResult))
        }
        const result = await Teacher.findAll({
            where: searchCondition,
            order: [['teacher_id', `${data.sort}`]]
        })
        const formattedResult = result.map(data => {
            data = data.get();
            data.createdAt = dayjs(data.createdAt).format('DD-MM-YYYY');
            data.updatedAt = dayjs(data.updatedAt).format('DD-MM-YYYY');
            return data;
        });
        return res.status(200).send(new SuccessRes("Fetching successfully.", formattedResult))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
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
        return res.status(400).send(new ErrorRes("Please enter valid id number values.", 400))
    }
    else if (!data.teacher_first_name || !data.teacher_last_name) {
        return res.status(400).send(new ErrorRes("Please enter your first name and your last name", 400))
    }

    try {
        const findId = await Teacher.findByPk(data.teacher_id)
        if (findId) {
            const data_update = await Teacher.update(data, { where: { teacher_id: data.teacher_id } })
            res.status(200).send(new SuccessRes("Update leaw ka", data_update))
        }
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

//########################## REMOVE ##########################
exports.removeSubjectByTeacher = async (req, res) => {
    const teacher_id = req.params.teacher_id;
    const subject_id = req.params.subject_id;

    if (teacher_id === 0 || subject_id === 0 || isNaN(teacher_id) || isNaN(subject_id)) {
        return res.status(400).send(new ErrorRes("Please enter valid number values.", 400))
    }

    try {
        const teacher = await Teacher.findByPk(teacher_id);
        if (teacher) {
            const subject = await Subject.findByPk(subject_id);
            if (subject) {
                
                teacher.subject_id = null;
                await teacher.save();
                res.status(200).send(new SuccessRes("Subject removed from teacher.", subject))
            }

            else {
                res.status(404).send(new ErrorRes("This id subject is not found.", 404))
            }
        }
        else {
            res.status(404).send(new ErrorRes("This id teacher is not found.", 404))
        }
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
};

//########################## CHECK ##########################
exports.checkIsTeacherAddThisSubject = async (req, res) => {
    const teacher_id = req.params.teacher_id;
    const subject_id = req.params.subject_id;

    try {
        const teacher = await Teacher.findByPk(teacher_id, {
            include: [{
                model: Subject,
                as: "subjects",
                where: { subject_id: subject_id },
                attributes: ["subject_id"],
                required: false,
            }]
        }
        );
        if (!teacher) {
            return res.status(404).send(new ErrorRes("Teacher not found.", 404))
        }
        if (teacher.subjects !== null) {
            return res.status(409).send(new ErrorRes("You already added this subject.", 409))
        }

        res.status(200).send(new SuccessRes("You can add this subject."))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
};

//########################## ADD ##########################
exports.addTeachSubject = async (req, res) => {
    const teacher_id = req.body.teacher_id;
    const subject_id = req.body.subject_id;
    try {
        if (!teacher_id || !subject_id) return res.status(400).send(new ErrorRes("Content can not be empty!", 400))

        const teacher = await Teacher.findByPk(teacher_id);
        if (!teacher) return res.status(400).send(new ErrorRes("Teacher id is not found!", 400))


        const subject = await Subject.findByPk(subject_id);
        if (!subject) return res.status(404).send(new ErrorRes("Subject id is not found!", 404))


        if (teacher.subject_id === subject_id) return res.status(400).send(new ErrorRes("You already add this subject.", 400))


        teacher.subject_id = subject_id;
        const result = await teacher.save(); // Save the new data back to the database

        res.status(200).send(new SuccessRes("Teacher add subject successfully.", result))

    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
};

//########################## DELETE ##########################
exports.deleteTeacherById = async (req, res) => {
    const id = req.params.id
    try {
        if (!id) return res.status(400).send(new ErrorRes(`Enter Teacher id.`, 400))


        const teacher = await Teacher.findByPk(id);
        if (!teacher) return res.status(404).send(new ErrorRes(`Teacher id=${id} not found`, 404))



        const result = await Teacher.destroy({ where: { teacher_id: id } })
        res.status(200).send(new SuccessRes(`Teacher id : ${id} deleted successfully`, result))

    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}