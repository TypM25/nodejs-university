//Check permission การเข้าถึงapi
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models/index.js");
const User = db.user;

// { ตัวแปร } ดึงค่าเฉพาะ key นั้น ๆ" ออกมาจาก object ใหญ่
const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
    //ตรวจสอบว่า err (object) ถูกสร้างมาจาก TokenExpiredError (class หรือ constructor ใด) 
    if (err instanceof TokenExpiredError) {
        //ถ้าหมดอายุ
        return res.status(401).send({
            message: "Unauthorized! Access Token was expired!",
            data: null,
            status_code: 401
        }); //ไม่ได้รับอนุญาต! โทเค็นการเข้าถึงหมดอายุแล้ว!
    }
    //ถ้าไม่หมดอายุ
    return res.status(401).send({
        message: "Unauthorized!",
        data: null,
        status_code: 401
    },

    ); //ไม่ได้รับอนุญาต
}


verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    //เมื่อไม่ใส่token ในheader
    if (!token) {
        return res.status(403).send({
            message: "No token provided!",
            data: null,
            status_code: 403
        });
    }

    jwt.verify(token,
        config.secret,
        (err, decoded) => {
            if (err) {
                return res.status(401).send({
                    message: "Unauthorized!",
                    data: null,
                    status_code: 401

                });
            }
            console.log(decoded)
            req.username = decoded.username;
            req.user_id = decoded.user_id;
            next();
        });
};


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
            res.status(403).send({
                message: "Require any roles!",
                data: null,
                status_code: 403
            });
            return;
        }
        catch {
            res.status(404).send({
                message: "No this role.",
                data: null,
                status_code: 404
            });
        }
    }
    catch (err) {
        res.status(500).send({
            message: err.message,
            data: null,
            status_code: 500
        })
    }
};


isStudent = async (req, res, next) => {
    try {
        let user = await User.findByPk(req.user_id)
        try {
            let roles = await user.getRoles()
            for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "student") {
                    next();
                    return;
                }
            }
            res.status(403).send({
                message: "Require student role!",
                data: null,
                status_code: 403
            });
            return;
        }
        catch {
            res.status(403).send({
                message: "Require another role to access.",
                data: null,
                status_code: 403
            });
        }
    }
    catch (err) {
        res.status(500).send({
            message: "Error : " + err.message,
            data: null,
            status_code: 500
        })
    }
};

isTeacher = async (req, res, next) => {
    try {
        console.log(req.user_id)
        let user = await User.findByPk(req.user_id)
        try {
            let roles = await user.getRoles()
            for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "teacher") {
                    next();
                    return;
                }
            }
            res.status(403).send({
                message: "Require teacher role!",
                data: null,
                status_code: 403
            });
            return;
        }
        catch {
            res.status(403).send({
                message: "Require another role to access.",
                data: null,
                status_code: 403
            });
        }
    }
    catch (err) {
        res.status(500).send({
            message: "Error : " + err.message,
            data: null,
            status_code: 500
        })
    }
};


isAdmin = async (req, res, next) => {
    try {
        let user = await User.findByPk(req.user_id)
        console.log(req.user_id)
        console.log(user)
        try {
            let roles = await user.getRoles()
            for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "admin") {
                    next();
                    return;
                }
            }
            res.status(403).send({
                message: "Require admin role!",
                data: null,
                status_code: 403
            });
            return;
        }
        catch {
            res.status(404).send({
                message: "No this role.",
                data: null,
                status_code: 404
            });
        }
    }
    catch (err) {
        res.status(500).send({
            message: err.message,
            data: null,
            status_code: 500
        })
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
