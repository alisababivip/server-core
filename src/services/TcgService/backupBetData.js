const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const Sequelize = require("sequelize");
const redis = require("@Databases/redis");
const TcgService = require("@Plugins/TcgService");
const { UserModel } = require("@Models/User/User");
const { BetHistoryModel } = require("@Models/Bet/BetHistory");

module.exports = async () => {
  try {
    const getRandomAllUser = await UserModel.findAll({
      order: Sequelize.literal("rand()"),
      attributes: ["username"]
    });

    for (const user of getRandomAllUser) {
      const startTime = moment().startOf("day").format("YYYY-MM-DD HH:mm:ss");
      const endTime = moment().endOf("day").format("YYYY-MM-DD HH:mm:ss");

      const getUserBetData = await TcgService.getBetDetailsMember(
        user.username,
        startTime,
        endTime,
        1
      );

      if (getUserBetData) {
        if (getUserBetData.status == 0) {
          console.log(`${user.name} : `, JSON.stringify(getUserBetData));
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
          console.log(`Service: Backup Bet Data: ${getUserBetData.error_desc}`);
        }
      } else {
        console.log(`Service: Backup Bet Data: Fail to connect!`);
      }
    }
  } catch (e) {
    console.log(e);
  }
};
