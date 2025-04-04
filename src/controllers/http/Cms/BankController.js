const {
    ERROR_PAGE,
    ERROR_FORM,
    ERROR_AUTH,
    ERROR_AUTH_MESSAGE,
    ERROR_MESSAGES
} = require("@Helpers/contants");

const { BankUserModel } = require("@Models/Bank/BankUser");
const BankWithdraw = require("@Configs/payment/BankWithdraw.json");

module.exports = {
    listBankWithdraw: async (req, res) => {
        try {
            res.status(200).json({
                status: true,
                data: BankWithdraw,
                msg: "Success",
                code: 200
            });
        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: false,
                msg: e.message,
                code: 500
            });
        }
    }
};
