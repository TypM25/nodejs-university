const db = require("../models");
const Op = db.Sequelize.Op;
const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { where } = require("sequelize");
const { SuccessRes, ErrorRes, ErrorCatchRes } = require('../utils/response.util.js')

const User = db.user;
const Role = db.role;
const RefreshToken = db.refreshToken;

//ลงทะเบียน
exports.signup = async (req, res) => {
    const raw_user = {
        username: req.body.username,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        role_name: req.body.role_name,
    }
    //เช็คไม่ได้ค่าที่ไม่กรอก
    for (const [key, value] of Object.entries(raw_user)) {
        if (!value) return res.status(400).send(new ErrorRes(`Please enter ${key}.`, 400))

    }

    if (raw_user.password !== raw_user.confirmPassword) return res.status(400).send(new ErrorRes(`Password and confirm password do not match.`, 400))

    const new_user = {
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 10),
        role_name: req.body.role_name,
    }

    try {

        const role = await Role.findOne({ where: { name: new_user.role_name } })

        if (!role) {
            return res.status(404).send(new ErrorRes("Role not found.", 404))
        }

        const user = await User.create(new_user)
        //ใส่[] เพราะ setRolesเป็น arrayเสมอ เพราะเชื่อมแบบmany to many 
        user.setRoles([role]) //มันจะไปเชื่อมกันเองใน  thrugh: "user_roles"
        user.save()

        res.status(200).send(new SuccessRes("Register succesful."))

        // const user = await User.create(new_user)
        // if (req.body.role_name) {
        //     const [role, created] = await Role.findOrCreate({
        //         where: { name: req.body.role_name }
        //     });

        //     // console.log("SignUp Roles : " + JSON.stringify(role));

        //     //เชื่อมความสัมพันธ์ระหว่าง User กับ Role
        //     await user.setRoles([role])
        //     return res.status(200).send({
        //         message: "User was registered successfully!",
        //         data: user,
        //         status_code: 200
        //     });
        // }
        // //กรณีไม่ได้ใส่role แต่ปกติดักให้เลือกroleอยู่เเล้ว
        // await user.setRoles([1]);
        // return res.status(200).send({
        //     message: "User was registered successfully!",
        //     data: user,
        //     status_code: 200
        // });
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

//ล็อคอิน
exports.signin = async (req, res) => {
    const data_login = {
        username: req.body.username,
        password: req.body.password
    }
    try {
        const user = await User.findOne({
            where: { username: data_login.username },
            include: [{
                model: Role,
                as: "roles",
                attributes: ["name"],
                through: {
                    attributes: [],
                }
            }]
        })

        //ถ้าหาusernameไม่เจอ
        if (!user) return res.status(404).send(new ErrorRes("User not found.", 404))

        //ตรวจสอบว่า รหัสผ่านที่ผู้ใช้กรอกตรงกับรหัสผ่านที่เก็บในฐานข้อมูล
        var passwordIsValid = bcrypt.compareSync(
            data_login.password,
            user.password
        );
        //false ถ้า password ไม่ถูกต้อง
        if (!passwordIsValid) return res.status(401).send(new ErrorRes("Invalid Password!", 401))
        // สร้าง token
        const token = jwt.sign({
            user_id: user.user_id,
            username: user.username,
            role: user.roles.map(role => role.name)
        },
            config.secret, { expiresIn: config.jwtExpiration });
        //สร้างrefresh tokenใหม่ 
        const refreshToken = await RefreshToken.createToken(user);

        //แปลงข้อมูล roles ให้กลายเป็นอาเรย์ตรวจสอบสิทธิ์หรือการอนุญาตการเข้าถึง
        //ดึงroleของผู้ใช้
        let authorities = [];
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                authorities.push(roles[i].name.toLowerCase());
            }
            //เมื่อlogin show
            res.status(200).send(new SuccessRes("Signin successfull.", {
                user_id: user.user_id,
                username: user.username,
                role_name: authorities, // เดิมที ทำรองรับroleที่เป็นลิส
                accessToken: token,
                refreshToken: refreshToken,
            }))
        })
    }
    catch (error) {
        res.status(500).send(new ErrorCatchRes(error))
    }
}

exports.signout = async (req, res) => {
    try {
        req.session = null;
        return res.status(200).send(new SuccessRes("You've been signed out!"))
    } catch (error) {
        this.next(error);
    }
};

exports.refreshToken = async (req, res) => {
    const { refreshToken: requestToken } = req.body;
    //no token send
    if (requestToken == null) return res.status(403).send(new ErrorRes("Refresh Token is required!", 403))


    try {
        //หาrefresh token in database
        const refreshToken = await RefreshToken.findOne({ where: { token: requestToken } });
        console.log(refreshToken)

        //ถ้าไม่เจอในฐานข้อมูล
        if (!refreshToken) return res.status(403).send(new ErrorRes("Refresh token is not in database!", 403))

        //ถ้าrefresh tokenหมดอายุเเล้ว
        if (RefreshToken.verifyExpiration(refreshToken)) {
            RefreshToken.destroy({ where: { username: refreshToken.username } });
            return res.status(403).send(new ErrorRes("Refresh token was expired. Please make a new signin request", 403))
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
        let newAccessToken = jwt.sign({
            user_id: user.user_id,
            username: user.username,
            role: user.roles.map(role => role.name)
        },
            config.secret, { expiresIn: config.jwtExpiration });



        return res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: refreshToken.token,
            status_code: 200
        });
    } catch (error) {

        res.status(500).send(new ErrorCatchRes(error))

    }
};

