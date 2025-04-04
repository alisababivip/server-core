const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const CronJob = require("node-cron");

module.exports = () => {
  const clearAfterTime = 1; // 1 hour

  const clearTask = CronJob.schedule(
    "* * * * *",
    () => {
      for (var user in TaskProcess.backupBetData) {
        try {
          if (TaskProcess.backupBetData.hasOwnProperty(user)) {
            const currentTime = moment().format("x");
            const taskCreateTime = moment(
              TaskProcess.backupBetData[user].time
            ).format("x");
            if (currentTime - taskCreateTime >= 60000 * (clearAfterTime * 60)) {
              TaskProcess.backupBetData[user].task.stop();
              delete TaskProcess.backupBetData[user];
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
