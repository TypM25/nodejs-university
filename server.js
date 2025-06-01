require('dotenv').config();
const express = require("express"); //ตัวช่วยสร้างเว็บเซิร์ฟเวอร์
const bodyParser = require("body-parser"); //แปลงข้อมูลที่ส่งเข้ามาให้เป็น JavaScript object
const cors = require("cors"); // ช่วยให้เปิดเว็บไซต์จากโดเมนอื่น 
const path = require("path"); //จัดการกับ path ของไฟล์
const app = express(); //สร้างเซิร์ฟเวอร์ Express
console.log('DB_HOST:', process.env.DB_HOST);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

//-------------------------------------------------SOCKET.IO-----------------------------------------------------
const { Server } = require("socket.io");
const { createServer } = require('node:http'); 
const server = createServer(app); //สร้าง HTTP server จาก Express
const socketHandler = require('./socket'); // โหลดฟังก์ชัน socket จากไฟล์อื่น
//สร้าง socket server 
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",  // กำหนดให้ Next.js เข้าถึงได้
    methods: ["GET", "POST"],
    credentials: true,
  },
});

socketHandler(io); // ส่ง io ไปให้จัดการต่อ
//--------------------------------------------------------------------------------------------------------------
var corsOptions = {
  //อนุญาตให้ทุกโดเมนเข้าถึง API นี้ได้
  origin: "*"
};


// ให้ Express เสิร์ฟไฟล์จากโฟลเดอร์นี้ที่ URL `/files`
app.use("/files", express.static(path.join(__dirname, "/resources/static/assets/uploads")));

//------------------------------------------------ติดตั้ง Middleware ต่าง ๆ-----------------------------------------------------
// ตัวแปรไว้ใช้ทั่วโปรเจกต์ว่าโปรเจกต์อยู่ที่ไหน
global.__basedir = __dirname;
//ให้ทุกโดเมนสามารถเข้าถึงได้
app.use(cors(corsOptions));
// แปลง JSON(ในrequest body) --> Object
app.use(express.json());
//รองรับข้อมูลที่ส่งมาจากฟอร์ม
app.use(express.urlencoded({ extended: true }));

//------------------------------------------------เชื่อมต่อฐานข้อมูล และสร้าง Role-------------------------------------------------
const db = require("./app/models");
const Role = db.role;

//true ลบdatabaseทุกครั้งที่run app 
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


//เริ่มรันเซิร์ฟเวอร์
const port = process.env.PORT;
//เริ่มเปิดให้คนเข้ามาใช้งานได้
server.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});

//ฟังก์ชันสร้าง Role
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
