const util = require("util");
const multer = require("multer");
const maxSize = 2 * 1024 * 1024;

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

//ทำให้สามารถใช้มิดเดิลแวร์วัตถุที่ส่งออกร่วมกับasync-await.
let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;