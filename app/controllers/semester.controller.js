const db = require("../models/index.js");
const Op = db.Sequelize.Op;
const { where, cast, col } = require('sequelize');
var jwt = require("jsonwebtoken");
const dayjs = require('dayjs');
const { SuccessRes, ErrorRes, ErrorCatchRes } = require('../utils/response.util.js')

const searchUtil = require('../utils/search.util.js');
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

    if (!req.body) return res.status(400).send(new ErrorRes("Content can not be empty!", 400))

    try {

        const checkSemester = await Semester.findOne({ where: { term_name: term.term_name, term_id: term.term_id } })
        if (checkSemester) return res.status(400).send(new ErrorRes("This semester is already existed.", 400))


        const new_semester = await Semester.create(term)
        res.status(200).send(new SuccessRes("New term added successfully", new_semester))
    }
    catch (error) {
        if (err.name === 'SequelizeUniqueConstraintError') return res.status(500).send(new ErrorRes("term_id alread", 500))
        res.status(500).send(new ErrorCatchRes(error))
    }
};
//########################## FIND ##########################
exports.findAllSemester = async (req, res) => {
    try {
        const semesters = await Semester.findAll()
        const formattedResult = semesters.map(data => {
            data = data.get();
            data.start_date = dayjs(data.start_date).format('DD-MM-YYYY');
            data.end_date = dayjs(data.end_date).format('DD-MM-YYYY');
            data.createdAt = dayjs(data.createdAt).format('DD-MM-YYYY');
            data.updatedAt = dayjs(data.updatedAt).format('DD-MM-YYYY');
            return data;
        });
        res.status(200).send(new SuccessRes("Fetching successfuly.", formattedResult))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

exports.findSemesterById = async (req, res) => {
    const term_id = req.body.term_id
    if (!term_id || isNaN((term_id)))
        return res.status(400).send(new ErrorRes("Please enter valid number values.", 400))

    try {
        const semester = await Semester.findByPk(term_id)
        console.log("semester ----> ", JSON.parse(JSON.stringify(semester)))
        if (!semester) return res.status(404).send(new ErrorRes("Can not find this term_id.", 404))

        res.status(200).send(new SuccessRes("Fetching data successfull.", semester))

    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}
//########################## SEARCH ##########################
exports.searchSemester = async (req, res) => {
    const input_status = {
        isTrue: req.body.status?.isTrue,
        isFalse: req.body.status?.isFalse
    };
    const status = []
    if (input_status.isTrue !== input_status.isFalse) {
        if (input_status.isTrue) status.push(true);
        if (input_status.isFalse) status.push(false);
    }
    // if (input_status.isTrue && input_status.isFalse || !input_status.isTrue && !input_status.isFalse) {
    //     status.length = 0
    // }
    // else {
    //     if (input_status.isTrue) {
    //         status.push(true)
    //     }
    //     if (input_status.isFalse) {
    //         status.push(false)
    //     }
    // }
    const data = {
        searchType: req.body.searchType,
        searchData: req.body.searchData,
        sort: req.body.sort || 'ASC',
        status: status.length === 0 ? null : status[0]
    };

    const cols_name = ['term_id', 'term_name', 'start_date', 'end_date', 'create_by', 'createdAt', 'updatedAt'];

    let searchCondition = {};


    if (data.searchData && data.searchType && cols_name.includes(data.searchType)) {
        searchCondition = searchUtil.setSearchCondition(data.searchType, data.searchData);
    }

    console.log('req.body.searchData:', req.body.searchData);
    console.log('data.searchData:', data.searchData);
    console.log("==========================================data", data)
    console.log("==========================================status", data.status)

    try {
        const term = await Semester.findAll({
            where: {
                [Op.and]: [
                    //... ใช้ได้กับเเค่arrayเท่านั้น
                    ...(Array.isArray(searchCondition) ? searchCondition : [searchCondition]),
                    ...(data.status !== null ? [{ is_open: data.status }] : [])
                ]
            },

            // where: {
            //     ...(searchCondition && { [Op.and]: searchCondition }),
            //     ...(data.status !== null && { is_open: data.status })
            // },
            order: [['term_id', `${data.sort}`]]
        });

        if (!term) return res.status(404).send(new ErrorRes("No data.", 404))



        const formattedResult = term.map(data => {
            data = data.get();
            data.start_date = dayjs(data.start_date).format('DD-MM-YYYY');
            data.end_date = dayjs(data.end_date).format('DD-MM-YYYY');
            data.createdAt = dayjs(data.createdAt).format('DD-MM-YYYY');
            data.updatedAt = dayjs(data.updatedAt).format('DD-MM-YYYY');
            return data;
        });

        res.status(200).send(new SuccessRes("Fetching data successful.", formattedResult))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

//########################## CHECK ##########################
exports.checkSemester = async (req, res) => {
    try {
        const term = await semesterService.checkSemester()
        if (!term) {
            const response = new SuccessRes(term.message)
            response.isOpen = false
            return res.status(200).send(response)
        }

        const response = new SuccessRes("Semester is currently open.", term.activeTerm)
        response.isOpen = true
        res.status(200).send(response)
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}


//########################## DELETE ##########################
exports.deleteSemester = async (req, res) => {
    const term_id = req.body.term_id
    if (!term_id || isNaN((term_id)))
        return res.status(400).send(new ErrorRes("Please enter valid number values.", 400))
    try {
        const semester = await Semester.destroy({ where: { term_id: term_id } })
        if (!semester) return res.status(400).send(new ErrorRes("No data for delete.", 400))


        res.status(200).send(new SuccessRes(`Term id : ${term_id} deleted successfully`, semester))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

//########################## UPDATE ##########################
exports.updateSemester = async (req, res) => {
    const id = req.body.id
    //รองรับค่าที่ไม่ได้กรอกเข้ามา
    const update_data = {
        ...(req.body.term_id && { term_id: req.body.term_id }),
        ...(req.body.term_name && { term_name: req.body.term_name }),
        ...(req.body.start_date && { start_date: req.body.start_date }),
        ...(req.body.end_date && { end_date: req.body.end_date }),
    };

    if (!id || isNaN((id)))
        return res.status(400).send(new ErrorRes("Please enter valid number values.", 400))

    try {
        const findTermId = await Semester.findByPk(id)
        if (!findTermId) return res.status(404).send(new ErrorRes("Term not found.", 404))

        //เขียนแบบนี้จะไม่สามารถเปลี่ยน PKได้
        // console.log(findTermId)
        // for (const [key, value] of Object.entries(update_data)) {
        //     if (findTermId[key] !== value) {
        //         findTermId[key] = value;
        //     }
        // }
        // await findTermId.save();



        const update_semester = await Semester.update(update_data, { where: { term_id: id } })
        res.status(200).send(new SuccessRes("Update term sucessfully.", update_semester))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}