// //กำหนดค่าที่เกี่ยวกับการยืนยันตัวตนด้วย JWT
// require("dotenv").config();  // เพิ่มบรรทัดนี้ไว้บนสุดของไฟล์

// module.exports = {
//   secret: process.env.JWT_SECRET,
//   jwtExpiration: process.env.JWT_EXPIRATION,
//   jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION,
// };


module.exports = {
    secret: "TypM-secret-key",
    jwtExpiration: 3600,           // 1 hour
    jwtRefreshExpiration: 86400,   // 24 hours
  };