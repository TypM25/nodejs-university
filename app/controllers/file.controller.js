const db = require("../models");
const Op = db.Sequelize.Op;
const fs = require("fs");
const baseUrl = "/files/";
const { where } = require("sequelize");

const uploadFile = require("../middleware/upload");

const Image = db.image
const Teacher = db.teacher
const Student = db.student


exports.upload = async (req, res) => {
    try {
        await uploadFile(req, res);

        if (!req.file) {
            return res.status(400).send({
                message: "Please upload a file!",
                data: null,
                status_code: 400
            })
        }

        const existingImage = await Image.findOne({
            where: { user_id: req.user_id }
        });

        // ถ้ามีรูปภาพแล้วให้ลบรูปภาพเก่า 
        if (existingImage) {
            const fs = require('fs');
            const oldPath = existingImage.data;   // path ของไฟล์เก่า เช่น 'resources/uploads/image.png'
            fs.unlinkSync(oldPath);              // ลบไฟล์เก่าออกจากโฟลเดอร์
        
            await existingImage.destroy();      // ลบข้อมูลรูปภาพเก่าใน database
        }

        const data = {
            user_id: req.user_id,
            name: req.file.originalname,     // ชื่อไฟล์
            type: req.file.mimetype,         // ประเภทไฟล์
            data: req.file.path,
            url: baseUrl + req.file.filename,
        };

        await Image.create(data)

        res.status(200).send({
            message: "Uploaded the file successfully: " + req.file.originalname,
            data: null,
            status_code: 200
        });


    } catch (err) {
        if (err.code == "LIMIT_FILE_SIZE") {
            return res.status(500).send({
                message: "File size cannot be larger than 2MB!",
                data: null,
                status_code: 500
            });
        }

        res.status(500).send({
            message: `Could not upload the file: ${req.file.originalname}. ${err}`,
            data: null,
            status_code: 500
        });
    }
};

//########################## FIND ##########################
exports.findImage = async (req, res) => {
    const id = req.body?.user_id || req.user_id
    console.log("user_id : ", req.user_id)

    try {
        const image = await Image.findOne({
            where: { user_id: id },
            attributes: ["name", "url"],
        })
        if (!image || image.length === 0) {
            res.status(200).send({
                message: "Empty.",
                data: null,
                status_code: 200
            });
        }
        res.status(200).send({
            message: "Fetching successfully.",
            data: image,
            status_code: 200
        });
    }
    catch (err) {
        res.status(500).send({
            message: "An error occurred: " + err.message,
            data: null,
            status_code: 500
        });
    }
};

exports.findMultiImage = async (req, res) => {
    const userIds = req.body

    try {
        const image = await Image.findAll({
            where: {
                user_id: {
                    [Op.in]: userIds
                }
            },
            attributes: ["user_id", "name", "url"],
            order: [["user_id", "ASC"]],

        })
        if (!image || image.length === 0) {
            res.status(200).send({
                message: "Empty.",
                data: null,
                status_code: 200
            });
        }
        res.status(200).send({
            message: "Fetching successfully.",
            data: image,
            status_code: 200
        });
    }
    catch (err) {
        res.status(500).send({
            message: "An error occurred: " + err.message,
            data: null,
            status_code: 500
        });
    }
};


// read all files in uploads folder, return list of files’ information (name, url)
exports.getListFiles = (req, res) => {
    const directoryPath = __basedir + "/resources/static/assets/uploads/";

    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            res.status(500).send({
                message: "Unable to scan files!",
                data: null,
                status_code: 500
            });
        }

        let fileInfos = [];

        files.forEach((file) => {
            fileInfos.push({
                name: file,
                url: baseUrl + file,
            });
        });


        res.status(200).send(fileInfos);

    });
};

//รับชื่อไฟล์เป็นพารามิเตอร์อินพุต จากนั้นใช้ Express res.download API 
// เพื่อถ่ายโอนไฟล์ที่เส้นทาง (ไดเร็กทอรี + ชื่อไฟล์) เป็น 'สิ่งที่แนบมา'
exports.download = (req, res) => {
    const fileName = req.params.name;
    const directoryPath = __basedir + "/resources/static/assets/uploads/";

    res.download(directoryPath + fileName, fileName, (err) => {
        if (err) {
            res.status(500).send({
                message: "Could not download the file. " + err,
                data: null,
                status_code: 500
            });
        }
    });
};

