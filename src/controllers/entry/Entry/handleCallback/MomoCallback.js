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

const teleBotSendMsg = require('@Plugins/TelegramBot');

const { BankHistoryModel } = require("@Models/Bank/BankHistory");
const { CardHistoryModel } = require("@Models/Card/CardHistory");
const { UserModel } = require("@Models/User/User");

const CHARGE_TYPE_ENUM = {
    BANK: 'bank',
    MOMO: 'momo',
};

const STATUS_ENUM = {
    SUCCESS: 'success',
    TIMEOUT: 'timeout',
    UNKNOW: 'unknown',
    DELETED: 'deleted',
    CANCEL: 'cancel',
    ERROR: 'error',
    PENDING: 'pending',
    DELETED: 'deleted'
}
// • success:  giao dịch đã thành công
// • timeout:  quá thời gian giao dịch
// • unknown:  giao dịch chuyển mà không tạo code (tương đương với succcess cho trường hợp dùng tên nhân vật)
// • deleted:  giao dịch bị từ chối (hệ thống từ chối giao dịch này)
// • cancel:   giao dịch bị hủy (do đối tác hoặc admin)

const RESPONSIVE_MESSAGE = {
    TRANSACTION_NOT_SUPPORTED: "Transaction type not supported!",
    TRANSACTION_NOT_FOUND: "No transaction found!",
    SOMETHING_WENT_WRONG: "Something went wrong, please try again!",
    SUCCESS: "success"
}

module.exports = async (socket, req, res, data) => {
    try {
        const botTeleConfig = JSON.parse(fs.readFileSync(process.env.PWD + "/src/configs/telegram/bot.json", "utf8"));
        const chatTeleConfig = JSON.parse(fs.readFileSync(process.env.PWD + "/src/configs/telegram/chatGroup.json", "utf8"));
        const messageTeleConfig = JSON.parse(fs.readFileSync(process.env.PWD + "/src/configs/telegram/message.json", "utf8"));

        if (data.status == STATUS_ENUM.SUCCESS) {
            let match = {};
            match.transId = data.requestId;
            match.type = BankHistoryModel.TYPE_ENUM.RECHARGE;
            match.status = BankHistoryModel.STATUS_ENUM.PENDING;
            const record = await BankHistoryModel.findOne({ where: match });

            if (!!record) {
                record.status = BankHistoryModel.STATUS_ENUM.SUCCESS;
                record.amount = Number(data.finish_amount);
                await record.save();
                await record.reload();

                const user = await UserModel.findOne({
                    where: { id: record.uid },
                    attributes: { exclude: ["password", "deletedAt", "code", "status", "role", "updatedAt"] },
                });

                user.coin += Number(data.finish_amount);
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

                // bắn socket tới user vừa nạp nếu user đó đang online trong socket
                socket.sendToUser(user.id, {
                    notify: {
                        type: "recharge",
                        title: `Nạp ví điện tử thành công!`,
                        message: `<p style=" text-align: center; font-size: 26px; ">Bạn vừa nạp thành công ${numberWithCommas(Number(data.finish_amount))} VND!</p>`
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
                    const amount = Helper.numberWithCommas(Number(data.finish_amount));
                    const trans_id = data.requestId;
                    const chargeTypeProvide = "Momo";
                    const chargeTypeProvideVi = "Ví điện tử";
                    const chargeTypeCode = "Momo";

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
        }

        if (data.status == STATUS_ENUM.TIMEOUT) {
            let match = {};
            match.transId = data.requestId;
            match.type = BankHistoryModel.TYPE_ENUM.RECHARGE;
            match.status = BankHistoryModel.STATUS_ENUM.PENDING;
            const record = await BankHistoryModel.findOne({ where: match });

            if (!!record) {
                record.status = BankHistoryModel.STATUS_ENUM.ERROR;
                await record.save();
                await record.reload();
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
        }

        if (data.status == STATUS_ENUM.ERROR) {
            let match = {};
            match.transId = data.requestId;
            match.type = BankHistoryModel.TYPE_ENUM.RECHARGE;
            match.status = BankHistoryModel.STATUS_ENUM.PENDING;
            const record = await BankHistoryModel.findOne({ where: match });

            if (!!record) {
                record.status = BankHistoryModel.STATUS_ENUM.ERROR;
                await record.save();
                await record.reload();
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
        }

        return res.json({
            status: false,
            msg: RESPONSIVE_MESSAGE.SUCCESS
        });
    } catch (e) {
        console.log(e);
        return res.json({
            status: false,
            msg: RESPONSIVE_MESSAGE.SOMETHING_WENT_WRONG
        });
    }
}