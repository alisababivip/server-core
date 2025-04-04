const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const momentRandom = require('moment-random');
const { findByID, findByUsername, UserModel } = require("@Models/User/User");
const Helpers = require("@Helpers/helpers");
const { validateEmail } = require("@Helpers/email");
const { randomString } = require("@Helpers/String");
const validator = require("validator");
const { generatePassword, validatePassword, randomPassword } = require("@Helpers/password");
const { BankListModel } = require("@Models/Bank/BankList");
const { BankHistoryModel } = require("@Models/Bank/BankHistory");
const BankListDeposit = require("@Configs/payment/BankDeposit.json");
const BankWithdraw = require("@Configs/payment/BankWithdraw.json");
const { BankUserModel } = require("@Models/Bank/BankUser");


const depositAmountList = [
    50000,
    100000,
    250000,
    300000,
    350000,
    400000,
    500000,
    600000,
    700000,
    1000000,
    4000000,
    5000000,
    20000000,
    10000000,
];

const bankProvideList = [
    {
        "name": "HA SON THANH",
        "bank": "MBBANK",
        "number": "3436909089999"
    },
    {
        "name": "PHAM DUC MINH	",
        "bank": "ABC",
        "number": "4557871"
    },
    {
        "name": "TRẦN QUANG NHẬT",
        "bank": "MOMO",
        "number": "0923891507"
    },
    {
        "name": "LE THANH HUYEN",
        "bank": "MOMO",
        "number": "0563039975"
    },
    {
        "name": "PHAM DUC MINH",
        "bank": "BIDV",
        "number": "42710001084423"
    }
];

const statusList = [
    "SUCCESS", "PENDING", "ERROR"
];


module.exports = async (from, to) => {
    const getAllUser = await UserModel.findAll();

    let bulkCreateData = [];
    let i = 1;
    for (const user of getAllUser) {
        const startCreate = moment(from, "MM-DD-YYYY");
        const endCreate = moment(to, "MM-DD-YYYY");

        const bankDeposit = bankProvideList[Helpers.getRandomInt(0, bankProvideList.length - 1)];
        const amountDeposit = depositAmountList[Helpers.getRandomInt(0, depositAmountList.length - 1)];
        const statusDeposit = statusList[Helpers.getRandomInt(0, statusList.length - 1)];

        const dataDeposit = {
            uid: user.id,
            bankProvide: bankDeposit.bank.toUpperCase(),
            bankNumber: bankDeposit.number,
            bankName: bankDeposit.name,
            transId: Helpers.getRandomInt(30000000, 99999999),
            type: BankHistoryModel.TYPE_ENUM.CASHOUT,
            amount: Number(amountDeposit),
            info: `Withdraw ${bankDeposit.bank.toUpperCase()} to the bank ${bankDeposit.bank.toUpperCase()} / ${bankDeposit.number}`,
            status: statusDeposit,
            createdAt: moment(momentRandom(endCreate, startCreate)).format("YYYY-MM-DD HH:MM:ss")
        }

        bulkCreateData.push(dataDeposit);
        //if (i == 30) break;
        i++;
    };

    //console.log(bulkCreateData);

    const create = await BankHistoryModel.bulkCreate(bulkCreateData, { ignoreDuplicates: true });
    if (!!create) { console.log("SUCCESS CREATE DEPOSIT!!!"); } else { console.log("ERROR CREATE DEPOSIT!!!"); }
}