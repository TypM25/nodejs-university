const db = require("../models");
const Op = db.Sequelize.Op;
const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const User = db.user;
const Role = db.role;
const RefreshToken = db.refreshToken;



exports.signup = async (req, res) => {
    new_user = {
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 10),
        role_name: req.body.role_name,
    }
    try {
        const user = await User.create(new_user)
        if (req.body.role_name) {
            // roles = ชื่อroleyนั้นๆ ซึ่งมีหลายroleได้
            const [role, created] = await Role.findOrCreate({
                where: { name: req.body.role_name }
            });

            console.log("SignUp Roles : " + JSON.stringify(role));
            //เชื่อมความสัมพันธ์ระหว่าง User กับ Role
            await user.setRoles([role])
            return res.status(200).send({
                message: "User was registered successfully!",
                data: user,
                status_code: 200
            });
        }
        await user.setRoles([1]);
        return res.status(200).send({
            message: "User was registered successfully!",
            data: user,
            status_code: 200
        });
    }
    catch (err) {
        res.status(500).send({
            message: err.message,
            data: null,
            status_code: 500
        });
    }
}

exports.signin = async (req, res) => {
    try {
        //user = userคนนั้นๆ
        const user = await User.findOne({
            where:
            {
                username: req.body.username
            },
            include: [{
                model: Role,
                as: "roles",
                attributes: ["name"],
                through: {
                    attributes: [],
                }
            }]
        })

        // console.log(user.toJSON())

        //ถ้าหาusernameไม่เจอ
        if (!user) {
            res.status(404).send({
                message: "User not found.",
                data: null,
                status_code: 404
            })
        }
        //ถ้าหาเจอusername 
        var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );
        //ถ้า password ไม่ถูกต้อง
        if (!passwordIsValid) {
            return res.status(401).send({
                message: "Invalid Password!",
                data: null,
                status_code: 401
            });
        }
        //ถ้า password ถูก
        // สร้าง token
        const token = jwt.sign({ user_id: user.user_id, username: user.username, role: user.roles.map(role => role.name) },
            config.secret, { expiresIn: config.jwtExpiration });


        const refreshToken = await RefreshToken.createToken(user);


        //แปลงข้อมูล roles ให้กลายเป็นอาเรย์ตรวจสอบสิทธิ์หรือการอนุญาตการเข้าถึง
        var authorities = [];
        //ดึงroleของผู้ใช้
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                authorities.push(roles[i].name.toLowerCase());
            }
            res.status(200).send({
                data: {
                    user_id : user.user_id,
                    username: user.username,
                    role_name: authorities,
                    accessToken: token,
                    refreshToken: refreshToken,
                },
                status_code: 200
            });
        })
    }
    catch (err) {
        res.status(500).send({
            message: "Error : " + err.message,
            data: null,
            status_code: 500
        });
    }

}

exports.signout = async (req, res) => {
    try {
        req.session = null;
        return res.status(200).send({
            message: "You've been signed out!",
            data: null,
            status_code: 200
        });
    } catch (err) {
        this.next(err);
    }
};


exports.refreshToken = async (req, res) => {
    const { refreshToken: requestToken } = req.body;

    if (requestToken == null) {
        return res.status(403).json({
            message: "Refresh Token is required!",
            data: null,
            status_code: 403
        });
    }

    try {
        const refreshToken = await RefreshToken.findOne({ where: { token: requestToken } });

        console.log(refreshToken)

        //ถ้าไม่เจอในฐานข้อมูล
        if (!refreshToken) {
            res.status(403).json({
                message: "Refresh token is not in database!",
                data: null,
                status_code: 403
            });
            return;
        }

        //ถ้าrefresh tokenหมดอายุเเล้ว
        if (RefreshToken.verifyExpiration(refreshToken)) {
            RefreshToken.destroy({ where: { username: refreshToken.username } });

            res.status(403).json({
                message: "Refresh token was expired. Please make a new signin request",
                data: null,
                status_code: 403
            });
            return;
        }

        //ถ้าrefreshtokenยังไม่หมดอายุ
        //ดึง user จาก refreshToken
        const user = await refreshToken.getUser({
            include: [{
                model: Role,
                as: "roles",
                attributes: ["name"],
                through: {
                    attributes: [],
                }
            }]
        });
        let newAccessToken = jwt.sign({ user_id : user.user_id,username: user.username, role: user.roles.map(role => role.name) },
            config.secret, { expiresIn: config.jwtExpiration });

        return res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: refreshToken.token,
            status_code: 200
        });
    } catch (err) {
        console.error("Signup/Signin Error:", err);
        res.status(500).send({
            message: err.message || err.toString() || "Unknown error",
            data: null,
            status_code: 500
        });
    }
};


// exports.relateRoleUser = async (req, res) => {
//     try {
//         let result = User.findAll({
//             attributes: ["username", "password"],
//             include: [{
//                 model: Role,
//                 as: "roles",
//                 attributes: ["id", "name"],
//                 through: {
//                     attributes: [],
//                 }
//             }]

//         })
//         if (result) {
//             res.send(result);
//         }
//     }
//     catch (err) {
//         res.status(500).send({
//             message:
//                 err.message
//         });
//     }
// }


