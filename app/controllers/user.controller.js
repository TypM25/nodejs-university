
const db = require("../models");
var bcrypt = require("bcryptjs");
const Op = db.Sequelize.Op;
const { where, cast, col } = require('sequelize');
const dayjs = require('dayjs');

const searchUtil = require('../utils/search.util.js');

const User = db.user;
const Role = db.role;

exports.allAccess = (req, res) => {
    res.status(200).send({
        message: "Public Content.",
        data: null,
        status_code: 200
    });
};


exports.userBoard = (req, res) => {
    res.status(200).send({
        message: "User Content.",
        data: null,
        status_code: 200
    });
};


exports.teacherBoard = (req, res) => {
    res.status(200).send({
        message: "Teacher Content.",
        data: null,
        status_code: 200
    });
};

exports.studentBoard = (req, res) => {
    res.status(200).send({
        message: "Student Content.",
        data: null,
        status_code: 200
    });
};

exports.adminBoard = (req, res) => {
    res.status(200).send({
        message: "Admin Content.",
        data: null,
        status_code: 200
    });
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

        res.status(200).send({
            data: formattedResult,
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

exports.findByUserId = async (req, res) => {
    const id = req.body.id
    if (!id || isNaN(id)) {
        return res.status(400).send({
            message: "Enter user id.",
            data: null,
            status_code: 400
        })
    }
    try {
        const user = await User.findByPk(id)
        if (!user) {
            return res.status(404).send({
                message: "User id is not found.",
                data: null,
                status_code: 404
            })
        }

        res.status(200).send({
            data: user,
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

exports.findByUsername = async (req, res) => {
    const username = req.body.username
    try {
        const user = await User.findOne({ where: { username: username } })
        if (!user) {
            return res.status(404).send({
                message: "Username is not found.",
                data: null,
                status_code: 404
            })
        }

        res.status(200).send({
            data: user,
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
            res.status(200).send({
                data: formattedResult,
                status_code: 200
            })
            return
        }
        //ถ้าsearch
        const user = await User.findAll({
            where: searchCondition,
            order: [['user_id', `${data.sort}`]]
        });
        if (!user) {
            return res.status(404).send({
                message: "No data.",
                data: null,
                status_code: 404
            })
        }

        const formattedResult = user.map(data => {
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
exports.changePassword = async (req, res) => {
    const data = {
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 10)
    }

    try {
        const user = await User.findOne({
            where: { username: data.username }
        })


        if (!user) {
            return res.status(400).send({
                message: "Username is not found.",
                data: null,
                status_code: 400
            })
        }
        
        user.password = data.password
        user.save()
        // await User.update(
        //     { password: data.password },
        //     { where: { username: data.username } }
        // )
        res.status(200).send({
            message: "Changed password successfully!",
            data: null,
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

//########################## DELETE ##########################

exports.deleteAllUser = async (req, res) => {
    try {
        await User.destroy({
            where: {}
        })
        res.status(200).send({
            message: "Users were deleted successfully!",
            data: null,
            status_code: 200
        });

    }
    catch (err) {
        res.status(500).send({
            message:
                err.message || "Some error occurred while removing all Users.",
            data: null,
            status_code: 500
        });
    }
};

exports.deleteByUsername = async (req, res) => {
    const data = { username: req.body.username }
    try {
        const user = await User.findOne({ where: { username: data.username } })
        if (!user) {
            return res.status(404).send({
                message: "This username is not found.",
                data: null,
                status_code: 404
            });
        }

        await User.destroy({ where: { username: data.username } })
        res.status(200).send({
            message: "Users were deleted successfully!",
            data: user,
            status_code: 200
        });
    }
    catch (err) {
        res.status(500).send({
            message:
                err.message || "Some error occurred while removing all Users.",
            data: null,
            status_code: 500
        });
    }
};
