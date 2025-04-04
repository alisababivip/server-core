const CronJob = require("node-cron");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const redis = require("@Databases/redis");
const TcgService = require("@Plugins/TcgService");
const { UserModel } = require("@Models/User/User");
const gameConfig = require("@Configs/game/gameConfig.json");

const backupBalanceByUser = async (username) => {
  let totalBalance = 0;
  let isTaskFailed = false;

  for (const [game, config] of Object.entries(gameConfig)) {
    const getBalance = await TcgService.getBalance(username, config.type);
    if (getUserBetData) {
      if (getBalance.status == 0) {
        // getBalance.balance
        isTaskFailed = false;
        if (getBalance.balance > 0) totalBalance += Number(getBalance.balance);
      } else {
        isTaskFailed = true;
        console.log(
          `Service Task BackUp Balance ${username}: ${getGame.error_desc}`
        );
      }
    } else {
      isTaskFailed = true;
      console.log(`Service Task BackUp Balance ${username}: Fail to connect!`);
    }
  }

  if (!isTaskFailed && totalBalance > 0) {
    try {
      const coinToVnd = totalBalance * 1000;
      UserModel.update({ coin: coinToVnd }, { where: { username } });
    } catch (error) {
      console.log(`Service Task BackUp Balance ${username} Coin :` + error);
    }
  }
};

const checkTaskExits = (username) => {
  return TaskProcess.backupBalanceData.hasOwnProperty(username);
};

const setTaskCron = (username) => {
  TaskProcess.backupBalanceData[username] = {};
  TaskProcess.backupBalanceData[username].time = moment();
  TaskProcess.backupBalanceData[username].task = CronJob.schedule(
    "* * * * *",
    () => {
      backupBalanceByUser(username);
    },
    {
      scheduled: true,
      timezone: "Asia/Ho_Chi_Minh"
    }
  );
  console.log(`Created Task Backup Balance For ${username}`);
};

module.exports = async (username) => {
  if (username) {
    if (checkTaskExits(username)) {
      try {
        TaskProcess.backupBalanceData[username].task.stop();
        delete TaskProcess.backupBalanceData[username];
      } catch (e) {
        console.log(e);
      }
    }
    // add task
    setTaskCron(username);
    return true;
  } else {
    console.log(`Please Add TaskName`);
    return false;
  }
};
