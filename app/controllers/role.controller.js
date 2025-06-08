const { where } = require("sequelize");
const db = require("../models");
const Op = db.Sequelize.Op;
const { SuccessRes, ErrorRes, ErrorCatchRes } = require('../utils/response.util.js')

const Role = db.role

exports.createRole = async (req, res) => {
    const role_name = req.body.role_name
    try {
        const isExist = await Role.findOne({ where: { name: req.body.name } })
        //ถ้าroleซ้ำ
        if (isExist) {
            return res.status(409).send(new ErrorRes("This role is exist.", 409))
        }
        const role = await Role.create(role_name)
        res.status(200).send(new SuccessRes("Created successfully.", role))
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))

    }
}

exports.AllRole = async (req, res) => {
    try {
        const roles = await Role.findAll()
        res.status(200).send(new SuccessRes("Fetching successfully.", roles))

    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))

    }
}