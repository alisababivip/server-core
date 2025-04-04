const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const CronJob = require("node-cron");

module.exports = () => {
  const clearAfterTime = 1; // 1 hour

  const clearTask = CronJob.schedule(
    "* * * * *",
    () => {
      for (var user in TaskProcess.backupBalanceData) {
        try {
          if (TaskProcess.backupBalanceData.hasOwnProperty(user)) {
            const currentTime = moment().format("x");
            const taskCreateTime = moment(
              TaskProcess.backupBalanceData[user].time
            ).format("x");
            if (currentTime - taskCreateTime >= 60000 * (clearAfterTime * 60)) {
              TaskProcess.backupBalanceData[user].task.stop();
              delete TaskProcess.backupBalanceData[user];
            }
          }
        } catch (e) {
          console.log(e);
        }
      }
    },
    {
      scheduled: false,
      timezone: "Asia/Ho_Chi_Minh"
    }
  );
  clearTask.start();
};
