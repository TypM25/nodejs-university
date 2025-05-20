const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); //เพื่อให้ API สามารถเรียกจากโดเมนอิ้รได้ พวกlocalhost:8080
const path = require("path");
const app = express();

//-------------------------------------------------SOCKET.IO-----------------------------------------------------
const { Server } = require("socket.io");
const { createServer } = require('node:http');
const server = createServer(app);
const socketHandler = require('./socket');
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",  // กำหนดให้ Next.js เข้าถึงได้
    methods: ["GET", "POST"],
    credentials: true,
  },
});

socketHandler(io);
//--------------------------------------------------------------------------------------------------------------


var corsOptions = {
  //อนุญาตให้โดเมน http://localhost:8081 เข้าถึง API นี้ได้
  origin: "*"
};


// ให้ Express เสิร์ฟไฟล์จากโฟลเดอร์นี้ที่ URL `/files`
app.use("/files", express.static(path.join(__dirname, "/resources/static/assets/uploads")));

global.__basedir = __dirname;

//ให้ทุกโดเมนสามารถเข้าถึงได้
app.use(cors(corsOptions));

// แปลง JSON(ในrequest body) --> Object
app.use(express.json());

//รองรับการส่งฟอร์มแบบ application/x-www-form-urlencoded
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// ดึงไฟล์ที่ใช้กำหนด Model และ Sequelize
const db = require("./app/models");
const Role = db.role;

//**ลบdatabaseทุกครั้งที่run ap
db.sequelize.sync({ force: false })
  .then(() => {
    console.log("Database synchronized without dropping tables!");
    initial();
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

// กำหนด route พื้นฐาน
app.get("/", (req, res) => {
  res.json({ message: "Welcome to TypM application." });
});

//นำเข้าเส้นทาง (Routes) จากไฟล์แยกและส่ง app ไปให้
require("./app/routes/admin.routes")(app);
require("./app/routes/student.routes")(app);
require('./app/routes/teacher.routes')(app);
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./cron/semesterUpdate')(app);






// กำหนด PORT
const PORT = process.env.PORT || 8000;
//เปิดเซิร์ฟเวอร์ และแสดงข้อความเมื่อเริ่มทำงาน
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Role.create({
    name: "student"
  }),
    Role.create({
      name: "admin"
    }),
    Role.create({
      name: "teacher"
    })
}

// let data = {
//   "student_id": 1,
//   "student_first_name": "Pin",
//   "student_last_name": "Mu",
//   "subjects": [
//       {
//           "subject_id": 1,
//           "subject_name": "Thai",
//           "create_date": "2025-04-03T07:29:37.619Z"
//       },
//       {
//           "subject_id": 2,
//           "subject_name": "Math",
//           "create_date": "2025-04-03T07:29:37.619Z"
//       }
//   ]
// }
// let answer = data.subjects.filter((data) => {
//   return data.subject_id === 1;
// })
// console.log(answer)
// let addteacher = data.map((da) => { return da.subjects["teacher"];} )
// console.log(addteacher)