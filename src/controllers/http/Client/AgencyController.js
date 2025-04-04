const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const { Op } = require("sequelize");
const {
    ERROR_PAGE,
    ERROR_FORM,
    ERROR_AUTH,
    ERROR_AUTH_MESSAGE,
    ERROR_MESSAGES
} = require("@Helpers/contants");
const { parseInt } = require("@Helpers/Number");
const {
    findByID,
    findByUsername,
    UserModel } = require("@Models/User/User");
const { BetHistoryModel } = require("@Models/Bet/BetHistory");
const { BankHistoryModel } = require("@Models/Bank/BankHistory");
const {
    findByRefCode,
    AgencyModel
} = require("@Models/Agency/Agency");
const { AgencyRefModel } = require("@Models/Agency/AgencyRef");


module.exports = {
    myRefShare: async (req, res) => {
        try {
            const agencyData = await AgencyModel.findOne({
                where: { uid: req.user.id }
            });
            res.status(200).json({
                status: true,
                agency: agencyData,
                msg: "SUCCESS"
            });
        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: false,
                msg: e.message,
                code: 500
            });
        }
    },
    countRefererUser: async (req, res) => {
        try {
            const agencyData = await AgencyModel.findOne({
                where: { uid: req.user.id },
            });
            const countRefUser = await AgencyRefModel.count({
                where: {
                    agency: agencyData.id
                }
            });

            res.status(200).json({
                status: true,
                count: countRefUser,
                msg: "SUCCESS"
            });
        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: false,
                msg: e.message,
                code: 500
            });
        }
    },
    countRefererUserToday: async (req, res) => {
        try {
            const agencyData = await AgencyModel.findOne({
                where: { uid: req.user.id },
            });
            const countRefUser = await AgencyRefModel.count({
                where: {
                    agency: agencyData.id,
                    createdAt: {
                        [Op.between]: [moment().startOf('days').format(), moment().endOf('days').format()]
                    }
                },
            });

            res.status(200).json({
                status: true,
                count: countRefUser,
                msg: "SUCCESS"
            });
        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: false,
                msg: e.message,
                code: 500
            });
        }
    },
    calculatorProfit: async (req, res) => {
        try {
            const agencyData = await AgencyModel.findOne({
                where: { uid: req.user.id }
            });
            const listUserRef = await AgencyRefModel.findAll({
                where: { agency: agencyData.id },
                attributes: ['id', 'uid', 'createdAt'],
                include: [
                    {
                        model: UserModel,
                        as: "userInfo",
                        attributes: { exclude: ["password", "id", "deletedAt", "code", "status", "role", "updatedAt"] },
                    }
                ],
                raw: true,
                nest: true
            });

            let exportData = listUserRef;
            let arrCursor = 0;
            for (var userRef of listUserRef) {
                let match = {};
                match.uid = userRef.uid;
                match.createdAt = {
                    [Op.between]: [moment().startOf('month').format(), moment().endOf('month').format()]
                }

                const getBetRecord = await BetHistoryModel.findAll({
                    where: match,
                    attributes: {
                        exclude: ['uid', 'username', 'updatedAt', 'deletedAt']
                    },
                    order: [["id", "DESC"]],
                });
                exportData[arrCursor].betRecord = getBetRecord;

                // chỉ lấy record success
                match.status = BankHistoryModel.STATUS_ENUM.SUCCESS;

                match.type = BankHistoryModel.TYPE_ENUM.RECHARGE;
                const getDepositRecord = await BankHistoryModel.findAll({
                    where: match,
                    attributes: ['amount', 'createdAt'],
                    order: [["id", "DESC"]],
                });
                exportData[arrCursor].depositRecord = getDepositRecord;

                match.type = BankHistoryModel.TYPE_ENUM.CASHOUT;
                const getWithdrawRecord = await BankHistoryModel.findAll({
                    where: match,
                    attributes: ['amount', 'createdAt'],
                    order: [["id", "DESC"]],
                });
                exportData[arrCursor].withdrawRecord = getWithdrawRecord;

                arrCursor++;
            }

            res.status(200).json({
                status: true,
                data: exportData,
                msg: "SUCCESS"
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
