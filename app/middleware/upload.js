const util = require("util"); //ใช้สำหรับฟังก์ชันช่วยเหลือ
const multer = require("multer"); //Lib สำหรับจัดการอัปโหลดไฟล์ใน Express
const maxSize = 2 * 1024 * 1024; // 2MB

//กำหนดค่าmulterเพื่อใช้กลไก Disk Storage
let storage = multer.diskStorage({
    //destinationกำหนดโฟลเดอร์ที่จะจัดเก็บไฟล์ที่อัปโหลด
    destination: (req, file, cb) => {
        cb(null, __basedir + "/resources/static/assets/uploads/");
    },
    //กำหนดชื่อไฟล์ภายในdestinationโฟลเดอร์
    filename: (req, file, cb) => {
        console.log(file.originalname);
        cb(null, file.originalname);
    },
});

let uploadFile = multer({
    storage: storage,
    //จำกัดขนาดไฟล์ได้
    limits: { fileSize: maxSize },
}).single("file");

//แปลง multer middleware ให้รองรับ async/await.
let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;