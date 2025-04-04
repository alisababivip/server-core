const fs = require('fs');
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const {
    ERROR_PAGE,
    ERROR_FORM,
    ERROR_AUTH,
    ERROR_AUTH_MESSAGE,
    ERROR_MESSAGES
} = require("@Helpers/contants")
const Helper = require("@Helpers/helpers");
const { parseInt } = require("@Helpers/Number");
const { numberWithCommas } = require("@Helpers/helpers");
const { randomString } = require("@Helpers/String");
const { BankHistoryModel } = require("@Models/Bank/BankHistory");
const { CardHistoryModel } = require("@Models/Card/CardHistory");
const { UserModel } = require("@Models/User/User");

const teleBotSendMsg = require('@Plugins/TelegramBot');

const USDT_RATE_ENUM = 23.500; // số tiền quy đổi sang VND/1$
const BONUS_DEPOSIT_PERCENT = 0; //  0%

const CHARGE_TYPE_ENUM = {
    BANK: 'bank',
    MOMO: 'wallet',
    USDT: 'usdt'
};

const STATUS_ENUM = {
    SUCCESS: 'success',
    ERROR: 'error',
    PENDING: 'pending',
    DELETED: 'deleted',
    TIMEOUT: 'timeout'
}

const RESPONSIVE_MESSAGE = {
    TRANSACTION_NOT_SUPPORTED: "Transaction type not supported!",
    TRANSACTION_NOT_FOUND: "No transaction found!",
    SOMETHING_WENT_WRONG: "Something went wrong, please try again!",
    STASTUS_NOT_SUPPORTED: "Status not supported!",
    SUCCESS: "success"
}

module.exports = {
    RechargeBank: async (req, res, socket) => {
        try {
            const {
                amount,
                uid,
                signature
            } = req.query;

            if (!amount || !uid || !signature) {
                return res.json({
                    status: false,
                    msg: ERROR_FORM.MISSING_FIELD
                });
            }

            const requestId = uid;

            let match = {};
            match.transId = requestId;
            match.type = BankHistoryModel.TYPE_ENUM.RECHARGE;
            match.status = BankHistoryModel.STATUS_ENUM.PROCESSING;

            const record = await BankHistoryModel.findOne({ where: match });

            if (!!record) {
                record.status = BankHistoryModel.STATUS_ENUM.SUCCESS;
                record.amount = Number(amount);
                await record.save();
                await record.reload();

                const user = await UserModel.findOne({
                    where: { id: record.uid },
                    attributes: { exclude: ["password", "deletedAt", "code", "status", "role", "updatedAt"] },
                });

                const amountActuallyReceived = Number(amount) + (Number(amount) * BONUS_DEPOSIT_PERCENT / 100);

                user.coin += Number(amountActuallyReceived);
                await user.save();
                await user.reload();

                const userJson = user.toJSON();
                delete userJson.password;
                delete userJson.verify;
                delete userJson.status;
                delete userJson.updatedAt;
                delete userJson.role;
                delete userJson.isPlay;
                delete userJson.deletedAt;
                delete userJson.createdAt;
                delete userJson.code;

                return res.json({
                    status: true,
                    msg: RESPONSIVE_MESSAGE.SUCCESS
                });
            } else {
                return res.json({
                    status: false,
                    msg: RESPONSIVE_MESSAGE.TRANSACTION_NOT_FOUND
                });
            }
        } catch (e) {
            console.log(e);
            return res.json({
                status: false,
                msg: RESPONSIVE_MESSAGE.SOMETHING_WENT_WRONG
            });
        }
    },
    RechargeWallet: async (req, res, socket) => {
        try {
            const {
                amount,
                uid,
                signature
            } = req.query;

            if (!amount || !uid || !signature) {
                return res.json({
                    status: false,
                    msg: ERROR_FORM.MISSING_FIELD
                });
            }

        } catch (e) {
            console.log(e);
            return res.json({
                status: false,
                msg: RESPONSIVE_MESSAGE.SOMETHING_WENT_WRONG
            });
        }
    },
    RechargeCard: async (req, res, socket) => {
        try {
            const {
                id,
                menhGiaThe,
                menhGiaDK,
                menhGiaThuc,
                status,
                requestId,
                signature
            } = req.query;

            if (!id || !menhGiaThe || !menhGiaDK || !menhGiaThuc || !status || !signature || !requestId) {
                return res.json({
                    status: false,
                    msg: ERROR_FORM.MISSING_FIELD
                });
            }

            const botTeleConfig = JSON.parse(fs.readFileSync(process.env.PWD + "/src/configs/telegram/bot.json", "utf8"));
            const chatTeleConfig = JSON.parse(fs.readFileSync(process.env.PWD + "/src/configs/telegram/chatGroup.json", "utf8"));
            const messageTeleConfig = JSON.parse(fs.readFileSync(process.env.PWD + "/src/configs/telegram/message.json", "utf8"));

            const card = await CardHistoryModel.findOne({
                where: {
                    transId: requestId,
                    type: CardHistoryModel.TYPE_ENUM.RECHARGE,
                    status: CardHistoryModel.STATUS_ENUM.PENDING
                }
            });

            if (!!card) {
                if (status == STATUS_ENUM.SUCCESS) {
                    card.status = CardHistoryModel.STATUS_ENUM.SUCCESS;
                    card.amount = Number(menhGiaThuc);
                    await card.save();
                    await card.reload();

                    const user = await UserModel.findOne({
                        where: { id: card.uid },
                        attributes: { exclude: ["password", "deletedAt", "code", "status", "role", "updatedAt"] },
                    });

                    user.coin += Number(menhGiaThuc);
                    await user.save();
                    await user.reload();

                    const userJson = user.toJSON();
                    delete userJson.password;
                    delete userJson.verify;
                    delete userJson.status;
                    delete userJson.updatedAt;
                    delete userJson.role;
                    delete userJson.isPlay;
                    delete userJson.deletedAt;
                    delete userJson.createdAt;
                    delete userJson.code;

                    socket.sendToUser(user.id, {
                        notify: {
                            type: "recharge",
                            title: `Nạp thẻ cào thành công!`,
                            message: `<p style=" text-align: center; font-size: 26px; ">Bạn vừa nạp thành công ${numberWithCommas(Number(menhGiaThuc))} điểm!</p>`
                        },
                        user: userJson
                    });


                    // thông báo telegram
                    if (botTeleConfig.status) {
                        const time = moment().format("DD/MM/YYYY HH:MM:ss");
                        const username = userJson.username;
                        const name = userJson.name;
                        const phone = userJson.phone;
                        const email = userJson.email;
                        const amount = Helper.numberWithCommas(Number(menhGiaThuc));
                        const trans_id = requestId;
                        const network = card.network;
                        const pin = card.pin;
                        const seri = card.seri;

                        await teleBotSendMsg(chatTeleConfig.paymentCard, messageTeleConfig.paymentCard, {
                            '{{time}}': time,
                            '{{username}}': username,
                            '{{name}}': name,
                            '{{phone}}': phone,
                            '{{email}}': email,
                            '{{amount}}': amount,
                            '{{transId}}': trans_id,
                            '{{network}}': network,
                            '{{pin}}': pin,
                            '{{seri}}': seri
                        });
                    }

                    return res.json({
                        status: true,
                        msg: RESPONSIVE_MESSAGE.SUCCESS
                    });

                } else if (status == STATUS_ENUM.DELETED) {
                    card.status = CardHistoryModel.STATUS_ENUM.ERROR;
                    await card.save();
                    await card.reload();
                    socket.sendToUser(card.uid, {
                        notify: {
                            type: "recharge",
                            title: `Nạp thẻ thất bại!`,
                            message: `<p style=" text-align: center; font-size: 26px; ">Nạp thẻ cào thất bại!</p>`
                        }
                    });
                    return res.json({
                        status: true,
                        msg: RESPONSIVE_MESSAGE.SUCCESS
                    });
                }
            } else {
                return res.json({
                    status: false,
                    msg: RESPONSIVE_MESSAGE.TRANSACTION_NOT_FOUND
                });
            }
        } catch (e) {
            console.log(e);
            return res.json({
                status: false,
                msg: RESPONSIVE_MESSAGE.SOMETHING_WENT_WRONG
            });
        }
    }
};
