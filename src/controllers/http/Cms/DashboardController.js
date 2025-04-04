const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const { Op } = require("sequelize");
const {
    ERROR_PAGE,
    ERROR_FORM,
    ERROR_AUTH,
    ERROR_AUTH_MESSAGE,
    ERROR_MESSAGES,
    SUCCESS
} = require("@Helpers/contants");
const { UserModel } = require("@Models/User/User");
const { AgencyModel } = require("@Models/Agency/Agency");
const { AgencyRefModel } = require("@Models/Agency/AgencyRef");
const { CardHistoryModel } = require("@Models/Card/CardHistory");
const { BankHistoryModel } = require("@Models/Bank/BankHistory");
const { BetHistoryModel } = require("@Models/Bet/BetHistory");

module.exports = {
    index: async (req, res) => {
        try {
            return res.status(200).json({
                status: true,
                msg: SUCCESS,
                code: 200
            });
        } catch (e) {
            console.log(e);
            return res.status(200).json({
                status: false,
                msg: e.message,
                code: 500
            });
        }
    },
    Statis: async (req, res) => {
        try {
            let { from, to } = req.query;
            let timeStart, timeEnd;
            if (!!from && !!to) {
                timeStart = moment(from, "DD/MM/YYYY").startOf('day');
                timeEnd = moment(to, "DD/MM/YYYY").endOf('day');
            } else {
                timeStart = moment().startOf('day');
                timeEnd = moment().endOf('day');
            }

            let totalDeposit = 0, totalWithdraw = 0, totalVolumeBet = 0, totalPlayProfit = 0;

            const cardRecord = await CardHistoryModel.findAll({
                where: {
                    createdAt: {
                        [Op.between]: [timeStart.format(), timeEnd.format()]
                    },
                    status: CardHistoryModel.STATUS_ENUM.SUCCESS
                },
                attributes: ['amount', 'createdAt'],
            });
            cardRecord.forEach((data) => {
                totalDeposit += Number(data.amount);
            });


            const bankRecord = await BankHistoryModel.findAll({
                where: {
                    createdAt: {
                        [Op.between]: [timeStart.format(), timeEnd.format()]
                    },
                    status: BankHistoryModel.STATUS_ENUM.SUCCESS
                },
                attributes: ['amount', 'type', 'createdAt'],
            });
            bankRecord.forEach((data) => {
                if (data.type == BankHistoryModel.TYPE_ENUM.RECHARGE) {
                    totalDeposit += Number(data.amount);
                } else if (data.type == BankHistoryModel.TYPE_ENUM.CASHOUT) {
                    totalWithdraw += Number(data.amount);
                }
            });
            const totalProfit = totalDeposit - totalWithdraw;

            const betRecord = await BetHistoryModel.findAll({
                where: {
                    createdAt: {
                        [Op.between]: [timeStart.format(), timeEnd.format()]
                    }
                },
                attributes: ['betAmount', 'netPnl'],
            });
            betRecord.forEach((data) => {
                totalVolumeBet += Number(data.betAmount);
                totalPlayProfit += Number(data.netPnl);
            });


            return res.status(200).json({
                status: true,
                data: {
                    totalDeposit,
                    totalWithdraw,
                    totalProfit,
                    totalVolumeBet,
                    totalPlayProfit
                },
                msg: SUCCESS,
                code: 200
            });
        } catch (e) {
            console.log(e);
            return res.status(200).json({
                status: false,
                msg: e.message,
                code: 500
            });
        }
    },
    Calculate: async (req, res) => {
        try {
            const totalSystemUser = await UserModel.count();
            const totalSystemUserIsAgency = await UserModel.count({ where: { role: UserModel.ROLE_ENUM.AGENCY } });
            const totalSystemUserRegisterByAgency = await AgencyRefModel.count();

            return res.status(200).json({
                status: true,
                data: {
                    totalSystemUser,
                    totalSystemUserIsAgency,
                    totalSystemUserRegisterByAgency
                },
                msg: SUCCESS,
                code: 200
            });
        } catch (e) {
            console.log(e);
            return res.json({
                status: false,
                msg: e.message,
                code: 500
            });
        }
    },
    SumBalance: async (req, res) => {
        try {
            let totalCoin = 0;
            const getUser = await UserModel.findAll({
                where: { role: { [Op.or]: [UserModel.ROLE_ENUM.USER, UserModel.ROLE_ENUM.AGENCY] } },
                attributes: ["coin"]
            });
            getUser.forEach((user) => totalCoin += user.coin);
            return res.status(200).json({
                status: true,
                totalCoin,
                msg: SUCCESS,
                code: 200
            });
        } catch (e) {
            console.log(e);
            return res.json({
                status: false,
                msg: e.message,
                code: 500
            });
        }
    }
};
