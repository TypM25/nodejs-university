const { where } = require("sequelize");


module.exports = (sequelize, Sequelize) => {
    const GradeDetail = sequelize.define("gradeDetail", {
        student_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'students',
                key: 'student_id'
            }
        },
        subject_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'subjects',
                key: 'subject_id'
            }
        },
        term_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'semesters',
                key: 'term_id'
            }
        },
        grade: {
            type: Sequelize.STRING,
            allowNull: false
        },
        score: {
            type: Sequelize.FLOAT,
            allowNull: false
        },
        credits: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
    }, {
        indexes: [
            {
                unique: true,
                fields: ['student_id', 'subject_id', 'term_id']
            }
        ]
    });

    GradeDetail.afterCreate(async (gradeDetail, options) => {
        const db = require("../models/index.js");
        const gradeTermService = require('../services/gradeTerm.service.js');
        const GradeTerm = db.gradeTerm
        setImmediate(async () => {
            try {
                const { gpa } = await gradeTermService.calculateGPA(gradeDetail.student_id, gradeDetail.term_id)
                const inputData = {
                    student_id: gradeDetail.student_id,
                    term_id: gradeDetail.term_id,
                    GPA: gpa
                }
                const gradeTerm = await GradeTerm.findOne({
                    where: {
                        student_id: inputData.student_id,
                        term_id: inputData.term_id,
                    }
                });

                if (gradeTerm) {
                    await gradeTerm.update({ GPA: inputData.GPA });
                    console.log("Updated gradeTerm successfully.");
                } else {
                    const newGradeTerm = await GradeTerm.create(inputData);
                    console.log("Created new gradeTerm successfully:", newGradeTerm.toJSON());
                }

                // const gradeTerm = await GradeTerm.create(inputData);
                // console.log("Creating gradeTerm successfully : ", gradeTerm)
            }
            catch (error) {
                console.log("Error: ", err)
            }
        });
    }
    )

    GradeDetail.afterUpdate(async (gradeDetail, options) => {
        const db = require("../models/index.js");
        const gradeTermService = require('../services/gradeTerm.service.js');
        const GradeTerm = db.gradeTerm

        try {
            console.log("student_id : ", gradeDetail.student_id)
            console.log("term_id : ", gradeDetail.term_id)
            const { gpa } = await gradeTermService.calculateGPA(gradeDetail.student_id, gradeDetail.term_id)
            const inputData = {
                student_id: gradeDetail.student_id,
                term_id: gradeDetail.term_id,
                GPA: gpa
            }

            const gradeTerm = await GradeTerm.update(inputData, {
                where: {
                    student_id: inputData.student_id,
                    term_id: inputData.term_id
                }
            })
            console.log("Updated gradeTerm successfully: ", gradeTerm);

        }
        catch (error) {
            console.log("Error: ", err)
        }

    }
    )

    GradeDetail.afterBulkDestroy(async (gradeDetail, options) => {
        const db = require('../models');
        const GradeTerm = db.gradeTerm;

        try {
            console.log("GradeTerm is destroyed by afterDestroy of GradeDetail.");

            await GradeTerm.destroy({
                where: {},
                truncate: true,
                restartIdentity: true
            });

            console.log("All gradeTerms have been deleted.");
        } catch (error) {
            console.error("Error deleting gradeTerms:", error.message);
        }
    }
    )


    return GradeDetail;
};
