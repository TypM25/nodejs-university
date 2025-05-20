const db = require("../models/index.js");
const Op = db.Sequelize.Op;
const { where, cast, col } = require('sequelize');
var jwt = require("jsonwebtoken");
const dayjs = require('dayjs');

const semesterService = require('../services/semester.service.js');
const Semester = db.semester

//########################## CREATE ##########################
exports.createSemester = async (req, res) => {
    const term_id = req?.body?.term_id.toString();
    const term_number = term_id[0];
    const year = term_id.slice(1);  // ตัดจาก index 1 จนจบ

    const now = new Date()
    const term = {
        term_id: req.body.term_id,
        term_name: `เทอม ${term_number} ปีการศึกษา ${year}`,
        start_date: new Date(req.body.start_date),
        end_date: new Date(req.body.end_date),
        is_open: new Date(req.body.start_date) <= now && new Date(req.body.end_date) >= now,
        create_by: req.user_id
    };
    const digits = term_id.toString().split('').map(Number);
    term.term_name = "เทอม " + digits[0] + " ปีการศีกษา " + digits[1] + digits[2] + digits[3] + digits[4]

    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!",
            data: null,
            status_code: 400
        });
        return;
    }

    try {

        const checkSemester = await Semester.findOne({ where: { term_name: term.term_name, term_id: term.term_id } })
        if (checkSemester) {
            return res.status(400).send({
                message: "เทอมซ้ำจ้า",
                data: null,
                status_code: 400
            })
        }

        const new_semester = await Semester.create(term)

        res.status(200).send({
            message: "New term added successfully",
            data: new_semester,
            status_code: 200
        });

    }
    catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).send({
                message: "term_id already exists.",
                data: null,
                status_code: 400
            });
        }

        res.status(500).send({
            message: "Error : " + err.message || "Some error occurred while creating the Student.",
            data: null,
            status_code: 500
        });
    }
};
//########################## FIND ##########################
exports.findAllSemester = async (req, res) => {
    try {
        const semesters = await Semester.findAll()
        const formattedResult = semesters.map(data => {
            data = data.get();
            data.start_date = dayjs(data.start_date).format('DD-MM-YYYY เวลา HH:mm:ss น.');
            data.end_date = dayjs(data.end_date).format('DD-MM-YYYY เวลา HH:mm:ss น.');
            data.createdAt = dayjs(data.createdAt).format('DD-MM-YYYY เวลา HH:mm:ss น.');
            data.updatedAt = dayjs(data.updatedAt).format('DD-MM-YYYY เวลา HH:mm:ss น.');
            return data;
        });
        res.status(200).send({
            message: "Fetching successfully.",
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

exports.findSemesterById = async (req, res) => {
    const term_id = req.body.term_id
    if (!term_id || isNaN((term_id))) {
        return res.status(400).send({
            message: "Please enter valid number values.",
            data: null,
            status_code: 400
        })
    }
    try {
        const semester = await Semester.findByPk(term_id)
        console.log("semester ----> ", JSON.parse(JSON.stringify(semester)))
        if (!semester) {
            return res.status(404).send({
                message: "Can not find this term_id.",
                data: null,
                status_code: 404
            })
        }
        res.status(200).send({
            message: "Fetching data successfull.",
            data: semester,
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


//########################## CHECK ##########################
exports.checkSemester = async (req, res) => {
    try {
        const term = await semesterService.checkSemester()
        if (!term) {
            return res.status(200).send({
                isOpen: false,
                message: "No active semester period right now.",
                data: null,
                status_code: 200
            });
        }

        res.status(200).send({
            isOpen: true,
            message: "Semester is currently open.",
            data: term,
            status_code: 200
        });
    }
    catch (err) {
        res.status(500).send({
            message: "Error : " + err.message,
            data: null,
            status_code: 500
        })
    }
}


//########################## DELETE ##########################
exports.deleteSemester = async (req, res) => {
    const term_id = req.body.term_id
    if (!term_id || isNaN((term_id))) {
        return res.status(400).send({
            message: "Please enter valid number values.",
            data: null,
            status_code: 400
        })
    }
    try {
        const semester = await Semester.destroy({ where: { term_id: term_id } })
        if (!semester) {
            return res.status(400).send({
                message: `No data for delete.`,
                data: semester,
                status_code: 400
            })
        }
        res.status(200).send({
            message: `Term id : ${term_id} deleted successfully`,
            data: semester,
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
exports.updateSemester = async (req, res) => {
    const id = Number(req.params.id)
    let update_data = {};
    if (req.body.term_id) update_data.term_id = req.body.term_id;
    if (req.body.term_name) update_data.term_name = req.body.term_name;
    if (req.body.start_date) update_data.start_date = req.body.start_date;
    if (req.body.end_date) update_data.end_date = req.body.end_date;

    if (!id || isNaN((id)) || id === 0) {
        return res.status(400).send({
            message: "Please enter valid number values.",
            data: null,
            status_code: 400
        })
    }

    const findTermId = await Semester.findByPk(id)
    if (!findTermId) {
        return res.status(404).send({
            message: "Term not found.",
            data: null,
            status_code: 404
        });
    }


    // if (!update_data.term_id || isNaN((update_data.term_id))) {
    //     return res.status(400).send({
    //         message: "Please enter new id.",
    //         data: null,
    //         status_code: 400
    //     })
    // }

    try {
        const update_semester = await Semester.update(update_data, { where: { term_id: id } })
        res.status(200).send({
            message: "Update term sucessfully.",
            data: update_semester,
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