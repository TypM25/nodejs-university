//กำหนดค่าที่เกี่ยวกับการยืนยันตัวตนด้วย JWT
module.exports = {
    secret: "TypM-secret-key",
    jwtExpiration: 3600,           // 1 hour
    jwtRefreshExpiration: 86400,   // 24 hours
  };