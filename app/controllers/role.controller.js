const { where } = require("sequelize");
const db = require("../models");
const Op = db.Sequelize.Op;

const Role = db.role

exports.createRole = async (req, res) => {
    const role_name = req.body.role_name
    try {
        const isExist = await Role.findOne({ where: { name: req.body.name } })
        //ถ้าroleซ้ำ
        if (isExist) {
            return res.status(409).send({
                message: "This role is exist.",
                data: role,
                status_code: 409
            });
        }
        const role = await Role.create(role_name)
        res.status(200).send({
            message: "Created successfully.",
            data: role,
            status_code: 200
        });

    }
    catch (err) {
        res.status(500).send({
            message: `Error : ${err}`,
            data: null,
            status_code: 500
        });

    }
}

exports.AllRole = async (req, res) => {
    try {
        const roles = await Role.findAll()
        res.status(200).send({
            message: "Fetching successfully.",
            data: roles,
            status_code: 200
        });

    }
    catch (err) {
        res.status(500).send({
            message: `Error : ${err}`,
            data: null,
            status_code: 500
        });

    }
}