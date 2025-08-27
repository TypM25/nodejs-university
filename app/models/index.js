

const dbConfig = require("../config/db.config.js");


const Sequelize = require("sequelize");
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false, 
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
});


const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.subject = require("./subject.model.js")(sequelize, Sequelize);
db.student = require("./student.model.js")(sequelize, Sequelize);
db.subject_student = require('./subjectStudent.model.js')(sequelize, Sequelize);

db.teacher = require("./teacher.model.js")(sequelize, Sequelize);
db.user = require("./user.model.js")(sequelize, Sequelize);
db.role = require("./role.model.js")(sequelize, Sequelize);
db.image = require("./image.model.js")(sequelize, Sequelize);

//เกรด
db.gradeDetail = require("./gradeDetail.model.js")(sequelize, Sequelize);
db.gradeTerm = require("./gradeTerm.model.js")(sequelize, Sequelize);

//เทอมการศึกษา
db.semester = require("./semester.model.js")(sequelize, Sequelize);
db.termHistory = require("./termHistory.model.js")(sequelize, Sequelize);

//ประเมินอาจารย์
db.evaluation = require("./evaluation.model.js")(sequelize, Sequelize);
db.evaluationDetail = require("./evaluationDetail.model.js")(sequelize, Sequelize);
db.teacherRating = require("./teacherRating.model.js")(sequelize, Sequelize);
db.question = require("./question.model.js")(sequelize, Sequelize);

//chat
db.chatHistory = require("./chatHistory.model.js")(sequelize, Sequelize);

db.refreshToken = require("../models/refreshToken.model.js")(sequelize, Sequelize);

db.updateStudent = require("./updateStudent.model.js")(sequelize, Sequelize);
db.updateSubject = require("./updateSubject.model.js")(sequelize, Sequelize);

// belong to ฝั่งที่ "เก็บ foreign key"
// hasMany hasOne ฝั่งไม่ได้เก็บforeign key แต่มีความสัมพันธ์

// sourceKey: คือ คอลัมน์ใน ตารางต้นทาง ex hasOne hasMany
// targetKey: คือ คอลัมน์ใน ตารางปลายทาง belongTo

//############################################### ROLE USER ###############################################
//user_role ตารางเชื่อมrole เเละ user 
db.role.belongsToMany(db.user, {
    through: "user_role",
    as: "users", //ชื่อเวลาrole include "users"
    foreignKey: "role_id" //PKจริงของrole FKของuser_role 
});
//user_role ตารางเชื่อมrole เเละ user 
db.user.belongsToMany(db.role, {
    through: "user_role",
    as: "roles", //ชื่อเวลาuser include "roles"
    foreignKey: "user_id" //PKจริงของusername FKของuser_role 
})

db.user.hasOne(db.student, {
    foreignKey: 'user_id',// ชื่อคอลลัมจริงๆในstudent ที่ใช้อิงFK
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

db.user.hasOne(db.teacher, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

db.user.hasOne(db.image, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
//############################################### STUDENT ###############################################
db.student.belongsToMany(db.subject, {
    through: 'subject_student',  // ใช้ชื่อของตารางที่เป็นตัวกลาง
    as: 'subjects',
    foreignKey: 'student_id',
    onDelete: 'CASCADE',
});


//many to one
db.student.belongsTo(db.user, {
    foreignKey: 'user_id', //  foreign key
});

db.student.belongsTo(db.user, {
    foreignKey: 'create_by', // ตั้งชื่อ foreign key
    targetKey: 'user_id'   // **ชื่อคอลลัมจริงๆในuser ที่ใช้อิงFK
});

db.student.hasMany(db.gradeDetail, {
    foreignKey: 'student_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

db.student.hasMany(db.gradeTerm, {
    foreignKey: 'student_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});


db.student.hasMany(db.termHistory, {
    foreignKey: "student_id",
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
})


db.student.belongsTo(db.semester, {
    foreignKey: 'term_id',  // FK ที่อยู่ใน student
});


//############################################### SUBJECT ###############################################
db.subject.belongsToMany(db.student, {
    through: "subject_student",
    as: "students",
    foreignKey: "subject_id", // คอลัมน์ subject_id ในตาราง subject_student
    onDelete: 'CASCADE',
});

db.subject.belongsTo(db.user, {
    foreignKey: 'create_by', // ตั้งชื่อ foreign key
    targetKey: 'user_id'   // **ชื่อคอลลัมจริงๆในuser ที่ใช้อิงFK
});

db.subject.hasMany(db.gradeDetail, {
    foreignKey: 'subject_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

db.subject.hasMany(db.teacher, {
    foreignKey: 'subject_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
db.subject.hasMany(db.termHistory, {
    foreignKey: "subject_id",
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
})

//############################################### TEACHER ###############################################
//user แต่ละคน "มี refreshToken ได้แค่ 1 อัน"
db.teacher.belongsTo(db.user, {
    foreignKey: 'user_id', // foreign key
});

// อาจารย์แต่ละคน สอนวิชาเดียว
db.teacher.belongsTo(db.subject, {
    foreignKey: "subject_id",  // FK ที่อยู่ใน teacher
    as: "subjects"
});


db.teacher.belongsTo(db.user, {
    foreignKey: 'create_by',
    targetKey: 'user_id'
});

//.............teacher_teacherRating.............
db.teacher.hasOne(db.teacherRating, {
    foreignKey: 'teacher_id',
    onDelete: 'CASCADE'   // ลบข้อมูลใน TeacherRating เมื่อ Teacher ถูกลบ
});

db.teacher.belongsTo(db.semester, {
    foreignKey: 'term_id',  
});

//############################################### GRADE ###############################################
//.............grade detail.............
db.gradeDetail.belongsTo(db.student, {
    foreignKey: 'student_id',
});
db.gradeDetail.belongsTo(db.subject, {
    foreignKey: 'subject_id',
});

db.gradeDetail.belongsTo(db.semester, {
    foreignKey: 'term_id',
});

//.............grade Term.............
db.gradeTerm.belongsTo(db.student, {
    foreignKey: 'student_id',
});

db.gradeTerm.belongsTo(db.semester, {
    foreignKey: 'term_id',
});

//############################################### HISTORY ###############################################
//.............updateStudent.............
db.updateStudent.belongsTo(db.user, {
    foreignKey: 'update_by',
    targetKey: 'username'
});

//.............updateSubject.............
db.updateSubject.belongsTo(db.user, {
    // มีคอลัมน์ update_by เป็น Foreign Key ที่เชื่อมกับ user.username
    foreignKey: 'update_by',
    targetKey: 'username'
});


//############################################### IMAGE ###############################################
db.image.belongsTo(db.user, {
    foreignKey: 'user_id',  // FK ที่อยู่ใน teacher
});

//############################################### SEMESTER ###############################################
db.semester.hasMany(db.student, {
    foreignKey: 'term_id',  // FK ที่อยู่ใน teacher
});

db.semester.hasMany(db.teacher, {
    foreignKey: 'term_id',  // FK ที่อยู่ใน teacher
});

db.semester.belongsTo(db.user, {
    foreignKey: 'create_by', // ตั้งชื่อ foreign key
    targetKey: 'user_id'   // **ชื่อคอลลัมจริงๆในuser ที่ใช้อิงFK
});

db.semester.hasMany(db.gradeDetail, {
    foreignKey: 'term_id'
});

db.semester.hasMany(db.gradeTerm, {
    foreignKey: 'term_id'
});

db.semester.hasMany(db.termHistory, {
    foreignKey: "term_id"
})

//############################################### TermHistory ###############################################
db.termHistory.belongsTo(db.semester, {
    foreignKey: 'term_id',
});

db.termHistory.belongsTo(db.student, {
    foreignKey: 'student_id',
});

db.termHistory.belongsTo(db.subject, {
    foreignKey: 'subject_id',
});
//############################################### EvaluationDetial ###############################################
db.evaluationDetail.belongsTo(db.teacher, {
    foreignKey: 'teacher_id',
    onDelete: 'CASCADE',
});
//############################################### Evaluation ###############################################
//.............evaluation_teacher.............
db.evaluation.belongsTo(db.teacher, {
    foreignKey: 'teacher_id',
    onDelete: 'CASCADE'
})

//############################################### TeacherRating ###############################################
db.teacherRating.belongsTo(db.teacher, {
    foreignKey: 'teacher_id',
});

//############################################### REFRESH ###############################################
//refreshTokenมี column username
db.refreshToken.belongsTo(db.user, {
    // มีคอลัมน์ username เป็น Foreign Key ที่เชื่อมกับ user.username
    foreignKey: 'username',
    targetKey: 'username'
});


//all role
db.ROLES = ["student", "admin", "teacher"];

module.exports = db;
