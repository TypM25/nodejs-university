const config = require("../config/auth.config");
const { v4: uuidv4 } = require("uuid");  // ใช้สร้าง token แบบสุ่ม

module.exports = (sequelize, Sequelize) => {
    // สร้าง Sequelize model ชื่อ "refreshToken"
    const RefreshToken = sequelize.define("refreshToken", {
        token: {
            type: Sequelize.STRING,
        },
        expiryDate: {
            type: Sequelize.DATE,
        },
    });

    //function สร้าง refresh token ให้กับ user ที่ login แล้ว
    RefreshToken.createToken = async (user) => {
        //สร้างวันหมดอายุของ token ขึ้นมา
        let expiredAt = new Date();
        //โดยเอาวันปัจจุบัน + จำนวนวินาทีที่ตั้งไว้ใน config
        expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration);

        //สร้างค่า token ของrefreshtoken แบบสุ่มด้วย uuidv4()
        let _token = uuidv4();

        //สร้างข้อมูล refresh token ลงในฐานข้อมูล
        let refreshToken = await RefreshToken.create({
            token: _token,
            username: user.username,
            expiryDate: expiredAt.getTime(),
        });
        //คืนค่า token ที่สร้างขึ้น
        return refreshToken.token;
    };

    //function เช็คว่าtoken หมดอายุยัง
    RefreshToken.verifyExpiration = (token) => {
        //ถ้าเวลาหมดอายุ (จาก database) < เวลาปัจจุบัน ---------→ token หมดอายุแล้ว
        return token.expiryDate.getTime() < new Date().getTime();
    };

    return RefreshToken;
};