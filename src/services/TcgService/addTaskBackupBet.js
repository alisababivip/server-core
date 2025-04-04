const CronJob = require("node-cron");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const redis = require("@Databases/redis");
const TcgService = require("@Plugins/TcgService");
const { UserModel } = require("@Models/User/User");
const { BetHistoryModel } = require("@Models/Bet/BetHistory");

const backupBetDataByUser = async (username) => {
  const startTime = moment().startOf("day").format("YYYY-MM-DD HH:mm:ss");
  const endTime = moment().endOf("day").format("YYYY-MM-DD HH:mm:ss");

  const getUserBetData = await TcgService.getBetDetailsMember(
    username,
    startTime,
    endTime,
    1
  );

  if (getUserBetData) {
    if (getUserBetData.status == 0) {
      if (getUserBetData.details.length > 0) {
        for (const betDetail of getUserBetData.details) {
          const keyCache = `bet_save_${betDetail.betOrderNo}`;
          const checkRedis = await redis.get(keyCache);
          if (!checkRedis) {
            const user = await UserModel.findOne({
              where: { username: betDetail.username },
              attributes: ["id"]
            });
            const betHistorySaveCheck = await BetHistoryModel.count({
              where: { betOrderNo: betDetail.betOrderNo },
              attributes: ["betOrderNo"]
            });

            if (!!user && betHistorySaveCheck <= 0) {
              BetHistoryModel.create({
                uid: user.id,
                username: betDetail.username,
                betAmount: betDetail.betAmount,
                validBetAmount: betDetail.validBetAmount,
                winAmount: betDetail.winAmount,
                netPnl: betDetail.netPnl,
                currency: betDetail.currency,
                transactionTime: betDetail.transactionTime,
                gameCode: betDetail.gameCode,
                gameName: betDetail.gameName,
                betOrderNo: betDetail.betOrderNo,
                betTime: betDetail.betTime,
                productType: betDetail.productType,
                gameCategory: betDetail.gameCategory,
                sessionId: betDetail.sessionId
              });
              redis.set(keyCache, { status: true });
            }
          }
        }
      }
    } else {
      console.log(
        `Service Task BackUp Bet Data ${username}: ${getUserBetData.error_desc}`
      );
    }
  } else {
    console.log(`Service Task BackUp Bet Data ${username}: Fail to connect!`);
  }
};

const checkTaskExits = (username) => {
  return TaskProcess.backupBetData.hasOwnProperty(username);
};

const setTaskCron = (username) => {
  TaskProcess.backupBetData[username] = {};
  TaskProcess.backupBetData[username].time = moment();
  TaskProcess.backupBetData[username].task = CronJob.schedule(
    "* * * * *",
    () => {
      backupBetDataByUser(username);
    },
    {
      scheduled: true,
      timezone: "Asia/Ho_Chi_Minh"
    }
  );
  console.log(`Created Task Backup Bet Data For ${username}`);
};

module.exports = async (username) => {
  if (username) {
    if (checkTaskExits(username)) {
      try {
        TaskProcess.backupBetData[username].task.stop();
        delete TaskProcess.backupBetData[username];
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
