require("dotenv").config();
const axios = require('axios');
let moment = require('moment-timezone');
moment.tz.setDefault("Asia/Ho_Chi_Minh");

const MESSAGE_ENUM = {
    MISSING_AGURMENT: "Missing argument!",
    SUCCESS: "success",
    ERROR_SOMETHING: "something went wrong!"
};

module.exports = async () => {
    try {
        const modeExcute = process.env.ENV_ENVIROMENT || "unknow";
        const telegramToken = process.env.TELEGRAM_TOKEN_DEPLOY || "6184549686:AAFtt1r8308Pn4K7px1W6YokkHq--vZ5BA0";
        const chatId = process.env.TELEGRAM_GROUP_DEPLOY || "-524035851";
        const message =
            `${(process.env.APPLICATION_NAME) ? process.env.APPLICATION_NAME : "AppNameErr"} || running with ${modeExcute.toUpperCase()} mode !!!`
            + "\n" +
            `Application started at : ${moment().format("DD/MM/YYYY HH:mm:ss a")}`
            + "\n";

        if (!telegramToken || !chatId || !message) return { status: false, msg: MESSAGE_ENUM.MISSING_AGURMENT };

        axios({
            method: `get`,
            url: `https://api.telegram.org/bot${telegramToken}/sendMessage?chat_id=${chatId}&text=${encodeURI(message)}`,
            headers: {}
        }).then((response) => {
            if (response.data.ok) {
                return { status: true, msg: MESSAGE_ENUM.SUCCESS, data: response.data.result };
            } else {
                return { status: false, msg: MESSAGE_ENUM.ERROR_SOMETHING };
            }
        }).catch((error) => {
            console.log(`Telegram Application Deploy: ` + error.response.data.description);
            return { status: false, msg: error.response.data.description };
        });
    } catch (e) {
        console.log(`Telegram Application Deploy: ` + e);
        return { status: false, msg: e.message };
    }
};