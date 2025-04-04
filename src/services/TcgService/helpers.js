const Helper = require("@Helpers/helpers");
const TcgService = require("@Plugins/TcgService");
const gameConfig = require("@Configs/game/gameConfig.json");
const { UserModel } = require("@Models/User/User");

const getTotalBalance = async (username) => {
  let totalBalance = 0;
  let isTaskFailed = false;
  for (const [game, config] of Object.entries(gameConfig)) {
    const getBalance = await TcgService.getBalance(username, config.type);
    if (getBalance) {
      if (getBalance.status == 0) {
        isTaskFailed = false;
        if (getBalance.balance > 0) totalBalance += Number(getBalance.balance);
      } else {
        isTaskFailed = true;
        break;
      }
    } else {
      isTaskFailed = true;
      console.log(`Service Task BackUp Balance ${username}: Fail to connect!`);
      break;
    }
  }

  if (!isTaskFailed) {
    return {
      status: true,
      totalBalance
    };
  } else {
    return {
      status: false,
      totalBalance
    };
  }
};

const resetBalanceToZero = async (username) => {
  for (const [game, config] of Object.entries(gameConfig)) {
    const resetBalance = await TcgService.userFullTransfer(
      username,
      config.type,
      Helper.randomInteger(100000000000, 999999999999) // transID
    );
  }
  return true;
};

const backupBalanceByUser = async (username) => {
  const getCurrentBalance = await getTotalBalance(username);
  if (getCurrentBalance.status) {
    try {
      const coinToVnd = getCurrentBalance.totalBalance * 1000;
      await UserModel.update({ coin: coinToVnd }, { where: { username } });
      return true;
    } catch (error) {
      console.log(`BackupBalanceByUser: ${username}: ` + error);
      return false;
    }
  }
};

module.exports = {
  getTotalBalance,
  resetBalanceToZero,
  backupBalanceByUser
};
