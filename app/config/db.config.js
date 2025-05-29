//config ใข้เพื่อเขื่อมต่อฐข้อมูล
module.exports = {
  HOST: "localhost",
  USER: "postgres",
  PASSWORD: "pin555",
  DB: "test_student_subject",
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};