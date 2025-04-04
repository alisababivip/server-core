const TcgService = require("@Plugins/TcgService");
const clientConfig = require("@Configs/game/clientConfig.json");
const subnamesConfig = require("@Configs/game/subnamesConfig.json");
const gameConfig = require("@Configs/game/gameConfig.json");
const { findByID, findByUsername, UserModel } = require("@Models/User/User");
const { generatePassword, validatePassword } = require("@Helpers/password");

const getBetDetails = async () => {
  const testAxios = await TcgService.getBalance('conmeo9999', 112);
  return testAxios;
};

const CreateAccountTCG = async () => {
  const getAllUser = await UserModel.findAll();
  for (const user of getAllUser) {
    // Create Account Tacgaming
    const createTcgUser = await TcgService.createUser(
      user.username,
      clientConfig.default_password
    );
    console.log(createTcgUser);
  }
}

module.exports = {
  // code here
  getBetDetails,
  CreateAccountTCG
};
