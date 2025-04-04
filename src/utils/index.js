const TelegramApplicationDeploy = require("@Plugins/TelegramApplicationDeploy");
const { getBetDetails, CreateAccountTCG } = require("@Plugins/TcgService/test");
const UserCreate = require("@Plugins/MigrateData/User");
const DepositCreate = require("@Plugins/MigrateData/Deposit");
const WithdrawCreate = require("@Plugins/MigrateData/Withdraw");
const workerThread = require("@Plugins/WorkerThread");

module.exports = async (io) => {
    // send notify to tele when application is running.
    //TelegramApplicationDeploy();
    //UserCreate();
    // for (let i = 1; i <= 5; i++) {
    //   DepositCreate("03-24-2023", "03-25-2023");
    //   DepositCreate("03-25-2023", "03-26-2023");
    // }

    // for (let i = 1; i <= 3; i++) {
    //   WithdrawCreate("03-24-2023", "03-25-2023");
    //   WithdrawCreate("03-25-2023", "03-26-2023");
    // }

    // //WithdrawCreate();
    // setInterval(() => {
    //   //console.log(io.users);
    //   //console.log(io.agents);
    // }, 1000);
};