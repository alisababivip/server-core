const {
    ERROR_PAGE,
    ERROR_FORM,
    ERROR_AUTH,
    ERROR_AUTH_MESSAGE,
    ERROR_MESSAGES,
    ERROR_SERVER,
    SUCCESS
} = require("@Helpers/contants");
const { VipModel } = require("@Models/Vip/Vip");
const { CardHistoryModel } = require("@Models/Card/CardHistory");
const { BankHistoryModel } = require("@Models/Bank/BankHistory");
const vipConfig = require("@Configs/vip/vipReward.json");

module.exports = {
    getCurrentVip: async (req, res) => {
        try {
            const getUserVip = await VipModel.findOne({ where: { uid: req.user.id }, attributes: ["uid", "vip_current"] })

            if (!!getUserVip) {
                const vipData = vipConfig[getUserVip.vip_current];
                vipData.current_vip = getUserVip.vip_current;

                let match = {};
                match.uid = req.user.id;
                match.status = BankHistoryModel.STATUS_ENUM.SUCCESS;
                match.type = BankHistoryModel.TYPE_ENUM.RECHARGE;
                const getUserDepositBank = await BankHistoryModel.findAll({
                    where: match,
                    attributes: ["amount"]
                });

                match.status = CardHistoryModel.STATUS_ENUM.SUCCESS;
                match.type = CardHistoryModel.TYPE_ENUM.RECHARGE;
                const getUserDepositCard = await BankHistoryModel.findAll({
                    where: match,
                    attributes: ["amount"]
                });

                let totalDeposit = 0;
                getUserDepositBank.forEach(deposit => totalDeposit += deposit.amount);
                getUserDepositCard.forEach(deposit => totalDeposit += deposit.amount);

                vipData.total_deposit = totalDeposit;

                res.status(200).json({
                    status: true,
                    data: vipData,
                    msg: SUCCESS,
                    code: 200
                });
            } else {
                res.status(200).json({
                    status: false,
                    msg: ERROR_SERVER.WRONG,
                    code: 404
                });
            }
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