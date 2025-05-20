const cron = require('node-cron');
const db = require('../app/models');
const Semester = db.semester;

module.exports = () => {
    cron.schedule('0 0 * * *', async () => {
      const now = new Date();
  
      await Semester.update(
        { is_open: false },
        { where: { end_date: { [db.Sequelize.Op.lt]: now } } }
      );
  
      await Semester.update(
        { is_open: true },
        {
          where: {
            start_date: { [db.Sequelize.Op.lte]: now },
            end_date: { [db.Sequelize.Op.gte]: now }
          }
        }
      );
  
      console.log("Cron: updated registration status");
    });
  };