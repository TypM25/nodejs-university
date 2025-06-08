
const db = require("../models");
var bcrypt = require("bcryptjs");
const Op = db.Sequelize.Op;
const { where, cast, col } = require('sequelize');
const dayjs = require('dayjs');
const { SuccessRes, ErrorRes, ErrorCatchRes } = require('../utils/response.util.js')

const searchUtil = require('../utils/search.util.js');

const User = db.user;
const Role = db.role;

exports.allAccess = (req, res) => {
    res.status(200).send(new SuccessRes("Public Content."))
};


exports.userBoard = (req, res) => {
    res.status(200).send(new SuccessRes("User Content."))
};


exports.teacherBoard = (req, res) => {
    res.status(200).send(new SuccessRes("Teacher Content."))
};

exports.studentBoard = (req, res) => {
    res.status(200).send(new SuccessRes("Student Content."))
};

exports.adminBoard = (req, res) => {
    res.status(200).send(new SuccessRes("Admin Content."))
};

//########################## FIND ##########################
exports.findAllUser = async (req, res) => {
    const sort = req.body?.sort ? req.body.sort.toUpperCase() : 'ASC';
    try {
        const user = await User.findAll({
            include: [{
                model: Role,
                as: "roles",
                attributes: ["role_id", "name"],
                through: { attributes: [] },
            }],
            order: [['user_id', sort]]
        })
        const formattedResult = user.map(data => {
            data = data.get();
            data.createdAt = dayjs(data.createdAt).format('DD-MM-YYYY');
            data.updatedAt = dayjs(data.updatedAt).format('DD-MM-YYYY');
            return data;
        });

        res.status(200).send(new SuccessRes("Fetching succesful.", formattedResult))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

exports.findByUserId = async (req, res) => {
    const id = req.body.id
    console.log('Received id:', id);
    if (!id || isNaN(Number(id))) return res.status(400).send(new ErrorRes("Enter user id.", 400))


    try {
        const user = await User.findByPk(id)
        if (!user) return res.status(404).send(new ErrorRes("User id is not found.", 404))

        res.status(200).send(new SuccessRes("Fetching succesful.", user))

    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

exports.findByUsername = async (req, res) => {
    const username = req.body.username
    try {
        const user = await User.findOne({ where: { username: username } })
        if (!user) return res.status(404).send(new ErrorRes("Username is not found.", 404))



        res.status(200).send(new SuccessRes("Fetching succesful.", user))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

//########################## SEARCH ##########################
exports.searchUser = async (req, res) => {
    const data = {
        searchType: req.body.searchType,
        searchData: req.body.searchData,
        sort: req.body.sort || 'ASC',
    };

    const cols_name = ['user_id', 'createdAt', 'username'];

    let searchCondition = {};

    if (data.searchData && data.searchType && cols_name.includes(data.searchType)) {
        searchCondition = searchUtil.setSearchCondition(data.searchType, data.searchData);
    }

    try {
        if (!data.searchData) {
            const user = await User.findAll({ order: [['user_id', `${data.sort}`]] });

            const formattedResult = user.map(data => {
                data = data.get();
                data.createdAt = dayjs(data.createdAt).format('DD-MM-YYYY');
                data.updatedAt = dayjs(data.updatedAt).format('DD-MM-YYYY');
                return data;
            });
            res.status(200).send(new SuccessRes("Fetching succesful.", formattedResult))
            return
        }
        //ถ้าsearch
        const user = await User.findAll({
            where: searchCondition,
            order: [['user_id', `${data.sort}`]]
        });
        if (!user) return res.status(404).send(new ErrorRes("No data.", 404))



        const formattedResult = user.map(data => {
            data = data.get();
            data.createdAt = dayjs(data.createdAt).format('DD-MM-YYYY');
            data.updatedAt = dayjs(data.updatedAt).format('DD-MM-YYYY');
            return data;
        });
        res.status(200).send(new SuccessRes("Fetching succesful.", formattedResult))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

//########################## UPDATE ##########################
exports.changePassword = async (req, res) => {
    const raw_data = {
        username: req.body.username,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    }

    //เมื่อไม่ได้กรอกข้อมูล
    for (const [key, value] of Object.entries(raw_data)) {
        if (!value) return res.status(404).send(new ErrorRes(`Please enter your ${key}.`, 404))
    }

    try {
        //เช็ค username มีจริงมั้ย
        const user = await User.findOne({
            where: { username: raw_data.username }
        })

        //ถ้าไม่เจอข้อมูล
        if (!user) return res.status(400).send(new ErrorRes("Username is not found.", 400))

        //หากรหัสผ่านไม่ตรง
        if (raw_data.password !== raw_data.confirmPassword)
            return res.status(400).send(new ErrorRes("Password and ConfirmPassword is not matching.", 400))

        const new_data = {
            username: raw_data.username,
            password: bcrypt.hashSync(raw_data.password, 10)
        }

        user.password = new_data.password
        user.save()
        // await User.update(
        //     { password: new_data.password },
        //     { where: { username: new_data.username } }
        // )

        res.status(200).send(new SuccessRes("Changed password successfully!."))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

//########################## DELETE ##########################

exports.deleteAllUser = async (req, res) => {
    try {
        await User.destroy({
            where: {}
        })

        res.status(200).send(new SuccessRes("Users were deleted successfully!"))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
};

exports.deleteUser = async (req, res) => {
    const id = req.body.user_id
    try {
        const user = await User.findOne({ where: { user_id: id } })
        if (!user) return res.status(404).send(new ErrorRes("This user_id is not found.", 404))

        await User.destroy({ where: { user_id: id } })
        res.status(200).send(new SuccessRes("Users were deleted successfully!", user))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
};
