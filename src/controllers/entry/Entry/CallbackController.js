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

const botTeleConfig = require('@Configs/telegram/bot.json');
const chatTeleConfig = require('@Configs/telegram/chatGroup.json');
const messageTeleConfig = require('@Configs/telegram/message.json');
const teleBotSendMsg = require('@Plugins/TelegramBot');

const { BankHistoryModel } = require("@Models/Bank/BankHistory");
const { CardHistoryModel } = require("@Models/Card/CardHistory");
const { UserModel } = require("@Models/User/User");

const Bank_handleCallback = require("./handleCallback/BankCallback");
const Momo_handleCallback = require("./handleCallback/MomoCallback");

const CHARGE_TYPE_ENUM = {
    BANK: 'bank',
    MOMO: 'momo',
};

const STATUS_ENUM = {
    SUCCESS: 'success',
    ERROR: 'error',
    PENDING: 'pending',
    DELETED: 'deleted'
}

const RESPONSIVE_MESSAGE = {
    TRANSACTION_NOT_SUPPORTED: "Transaction type not supported!",
    TRANSACTION_NOT_FOUND: "No transaction found!",
    SOMETHING_WENT_WRONG: "Something went wrong, please try again!",
    SUCCESS: "success"
}

module.exports = {
    Recharge: {
        Bank: async (req, res, socket) => {
            try {
                const {
                    chargeId,
                    chargeType,
                    chargeCode,
                    regAmount,
                    chargeAmount,
                    status,
                    requestId
                } = req.query;

                if (!chargeId || !chargeType || !chargeCode || !regAmount || !chargeAmount || !status || !requestId) {
                    return res.json({
                        status: false,
                        msg: ERROR_FORM.MISSING_FIELD
                    });
                }

                if (chargeType == CHARGE_TYPE_ENUM.BANK || chargeType == CHARGE_TYPE_ENUM.MOMO) {

                    if (status == STATUS_ENUM.SUCCESS) {
                        let match = {};
                        match.transId = requestId;
                        match.type = BankHistoryModel.TYPE_ENUM.RECHARGE;
                        match.status = BankHistoryModel.STATUS_ENUM.PENDING;

                        const record = await BankHistoryModel.findOne({ where: match });

                        if (!!record) {
                            record.status = BankHistoryModel.STATUS_ENUM.SUCCESS;
                            record.amount = Number(chargeAmount);
                            await record.save();
                            await record.reload();

                            const user = await UserModel.findOne({
                                where: { id: record.uid },
                                attributes: { exclude: ["password", "deletedAt", "code", "status", "role", "updatedAt"] },
                            });

                            user.coin += Number(chargeAmount);
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

                            const rechargeType = (chargeType == CHARGE_TYPE_ENUM.MOMO) ? "ví điện tử" : "ngân hàng";


                            // bắn socket tới user vừa nạp nếu user đó đang online trong socket
                            socket.sendToUser(user.id, {
                                notify: {
                                    type: "recharge",
                                    title: `Nạp ${rechargeType} thành công!`,
                                    message: `<p style=" text-align: center; font-size: 26px; ">Bạn vừa nạp thành công ${numberWithCommas(Number(chargeAmount))} điểm!</p>`
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
                                const amount = Helper.numberWithCommas(Number(chargeAmount));
                                const trans_id = requestId;
                                const chargeTypeProvide = chargeType.toUpperCase();
                                const chargeTypeProvideVi = rechargeType;
                                const chargeTypeCode = chargeCode;

                                await teleBotSendMsg(chatTeleConfig.paymentBank, messageTeleConfig.paymentBank, {
                                    '{{time}}': time,
                                    '{{username}}': username,
                                    '{{name}}': name,
                                    '{{phone}}': phone,
                                    '{{email}}': email,
                                    '{{amount}}': amount,
                                    '{{transId}}': trans_id,
                                    '{{chargeTypeProvide}}': chargeTypeProvide,
                                    '{{chargeTypeProvideVi}}': chargeTypeProvideVi,
                                    '{{chargeTypeCode}}': chargeTypeCode
                                });
                            }

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
                    } else if (STATUS_ENUM.ERROR) {

                    }
                } else {
                    return res.json({
                        status: false,
                        msg: RESPONSIVE_MESSAGE.TRANSACTION_NOT_SUPPORTED
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
        Card: async (req, res, socket) => {
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
        },
        BingChilling: async (req, res, socket) => {
            try {
                const {
                    id,
                    type,
                    code,
                    sender,
                    status,
                    finish_amount,
                    momo_transId,
                    requestId,
                    signature
                } = req.query;

                if (!id || !type || !status || !finish_amount || !requestId || !signature) {
                    return res.json({
                        status: false,
                        msg: ERROR_FORM.MISSING_FIELD
                    });
                }

                switch (type) {
                    case CHARGE_TYPE_ENUM.BANK:
                        await Bank_handleCallback(socket, req, res, req.query);
                        break;

                    case CHARGE_TYPE_ENUM.MOMO:
                        await Momo_handleCallback(socket, req, res, req.query);
                        break;

                    default:
                        return res.json({
                            status: false,
                            msg: RESPONSIVE_MESSAGE.TRANSACTION_NOT_SUPPORTED
                        });
                        break;
                }
            } catch (e) {
                console.log(e);
                return res.json({
                    status: false,
                    msg: RESPONSIVE_MESSAGE.SOMETHING_WENT_WRONG
                });
            }
        }
    }
};
