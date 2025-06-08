//Check permission การเข้าถึงapi
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models/index.js");
const User = db.user;
const { SuccessRes, ErrorRes, ErrorCatchRes } = require('../utils/response.util.js')

// { ตัวแปร } ดึงค่าเฉพาะ key นั้น ๆ" ออกมาจาก object ใหญ่
const { TokenExpiredError } = jwt;


//ตรวจสอบ JWT token ว่าถูกต้องไหม
verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    //เมื่อไม่ใส่token ในheader
    if (!token) return res.status(403).send(new ErrorRes("No token provided!", 403))



    jwt.verify(token,
        config.secret,
        (error, decoded) => {
            if (error) return res.status(401).send(new ErrorRes("Unauthorized!", 401))
            req.username = decoded.username;
            req.user_id = decoded.user_id;
            console.log('Decoded token:', decoded);
            next();
        });
};

//ตรวจว่ามี role ใด role หนึ่งไหม
isUser = async (req, res, next) => {
    try {
        let user = await User.findByPk(req.user_id)
        console.log(req.user_id)
        console.log(user)
        try {
            let roles = await user.getRoles()
            if (roles.length > 0) {
                next();
                return;
            }
            res.status(403).send(new ErrorRes("Require some role!", 403))
            return;
        }
        catch {
            res.status(404).send(new ErrorRes("No any roles.", 404))
        }
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
};

//ตรวจว่า role เป็น student
isStudent = async (req, res, next) => {
    try {
        let user = await User.findByPk(req.user_id)
        try {
            let roles = await user.getRoles()
            if (roles.some(role => role.name === "student")) {
                return next();
            }
            res.status(403).send(new ErrorRes("Require student role!", 403))
            return;
        }
        catch {
            res.status(403).send(new ErrorRes("Require another role to access.", 403))
        }
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
};

//ตรวจว่า role เป็น teacher
isTeacher = async (req, res, next) => {
    try {
        console.log(req.user_id)
        let user = await User.findByPk(req.user_id)
        try {
            let roles = await user.getRoles()
            if (roles.some(role => role.name === "teacher")) {
                return next();
            }
            res.status(403).send(new ErrorRes("Require teacher role!", 403))
            return;
        }
        catch {
            res.status(403).send(new ErrorRes("Require another role to access.", 403))
        }
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
};

//ตรวจว่า role เป็น admin
isAdmin = async (req, res, next) => {
    try {
        let user = await User.findByPk(req.user_id)
        console.log(req.user_id)
        console.log(user)
        try {
            let roles = await user.getRoles()
            if (roles.some(role => role.name === "admin")) {
                return next();
            }

            res.status(403).send(new ErrorRes("Require admin role!", 403))
            return;
        }
        catch {
            res.status(404).send(new ErrorRes("No this role.", 404))
        }
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
};


const authJwt = {
    verifyToken: verifyToken,
    isStudent: isStudent,
    isTeacher: isTeacher,
    isAdmin: isAdmin,
    isUser: isUser
};
module.exports = authJwt;
