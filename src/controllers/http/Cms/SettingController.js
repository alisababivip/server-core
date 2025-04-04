const { Op } = require("sequelize");
const redis = require("@Databases/redis");
const Helper = require("@Helpers/helpers");
const {
    ERROR_PAGE,
    ERROR_FORM,
    ERROR_AUTH,
    ERROR_AUTH_MESSAGE,
    ERROR_MESSAGES,
    SUCCESS
} = require("@Helpers/contants");
const { parseInt } = require("@Helpers/Number");
const { _SRC_PATH, _ROOT_PATH, getJsonConfig, setJsonConfig } = require("@Helpers/helpers");
const {
    ConfigModel,
    getConfigFromDB,
    setConfigFromDB } = require("@Models/Configs/Configs");

module.exports = {
    index: async (req, res) => {
        try {
            res.status(200).json({
                status: true,
                msg: SUCCESS,
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
    },
    General: async (req, res) => {
        try {
            const getConfigSite = await getConfigFromDB(ConfigModel.KEY_ENUM.SITE_INFOMATION);
            res.status(200).json({
                status: true,
                data: getConfigSite.value,
                msg: SUCCESS,
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
    },
    Telegram: async (req, res) => {
        try {
            const getConfigBot = getJsonConfig(`${_SRC_PATH}/configs/telegram/bot.json`);
            const getConfigChatGroup = getJsonConfig(`${_SRC_PATH}/configs/telegram/chatGroup.json`);
            const getConfigMessage = getJsonConfig(`${_SRC_PATH}/configs/telegram/message.json`);

            res.status(200).json({
                status: true,
                data: {
                    bot: getConfigBot,
                    chatGroup: getConfigChatGroup,
                    message: getConfigMessage
                },
                msg: SUCCESS,
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
    },
    Action: {
        updateGeneral: async (req, res) => {
            try {
                const bodySet = req.body;
                // set site_url
                if (void 0 !== bodySet.siteUrl && bodySet.siteUrl) {
                    setJsonConfig(`${_SRC_PATH}/configs/website/information.json`, `site_url`, bodySet.siteUrl);
                }
                // set sitename
                if (void 0 !== bodySet.siteName && bodySet.siteName) {
                    setJsonConfig(`${_SRC_PATH}/configs/website/information.json`, `site_name`, bodySet.siteName);
                }
                // set site logo
                if (void 0 !== bodySet.siteLogo && bodySet.siteLogo) {
                    setJsonConfig(`${_SRC_PATH}/configs/website/information.json`, `site_logo`, bodySet.siteLogo);
                }
                // set site description
                if (void 0 !== bodySet.siteDescription && bodySet.siteDescription) {
                    setJsonConfig(`${_SRC_PATH}/configs/website/information.json`, `site_description`, bodySet.siteDescription);
                }
                // set site keyword
                if (void 0 !== bodySet.siteKeyword && bodySet.siteKeyword) {
                    setJsonConfig(`${_SRC_PATH}/configs/website/information.json`, `site_keyword`, bodySet.siteKeyword);
                }
                // set site banner
                if (void 0 !== bodySet.siteBanner && bodySet.siteBanner) {
                    setJsonConfig(`${_SRC_PATH}/configs/website/information.json`, `site_banner`, bodySet.siteBanner);
                }
                // set site brand marquee
                if (void 0 !== bodySet.siteBrandMarquee && bodySet.siteBrandMarquee) {
                    setJsonConfig(`${_SRC_PATH}/configs/website/information.json`, `site_brand_marquee`, bodySet.siteBrandMarquee);
                }
                // set site announcement
                if (void 0 !== bodySet.announcement && bodySet.announcement) {
                    setJsonConfig(`${_SRC_PATH}/configs/website/information.json`, `announcement`, bodySet.announcement);
                }
                // set site contact info
                if (void 0 !== bodySet.contact && bodySet.contact) {
                    setJsonConfig(`${_SRC_PATH}/configs/website/information.json`, `contact`, bodySet.contact);
                }
                // set site copyright
                if (void 0 !== bodySet.copyright && bodySet.copyright) {
                    setJsonConfig(`${_SRC_PATH}/configs/website/information.json`, `copyright`, bodySet.copyright);
                }

                const currentFileSetting = getJsonConfig(`${_SRC_PATH}/configs/website/information.json`);

                if (!await setConfigFromDB(ConfigModel.KEY_ENUM.SITE_INFOMATION, currentFileSetting)) {
                    return res.status(200).json({
                        status: false,
                        msg: ERROR_SERVER,
                        code: 500
                    });
                }

                // update to redis
                const keyCache = `server_site_infomation`;
                await redis.set(keyCache, currentFileSetting);

                return res.status(200).json({
                    status: true,
                    msg: SUCCESS,
                    data: currentFileSetting,
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
        },
        updateTelegram: async (req, res) => {
            try {
                const bodySet = req.body;

                // set bot config status
                if (void 0 !== bodySet.botStatus && bodySet.botStatus) {
                    setJsonConfig(`${_SRC_PATH}/configs/telegram/bot.json`, `status`, JSON.parse(bodySet.botStatus));
                }
                // set bot config token
                if (void 0 !== bodySet.botToken && bodySet.botToken) {
                    setJsonConfig(`${_SRC_PATH}/configs/telegram/bot.json`, `token`, bodySet.botToken);
                }

                // set chat id group paymentCard
                if (void 0 !== bodySet.paymentCard && bodySet.paymentCard) {
                    setJsonConfig(`${_SRC_PATH}/configs/telegram/chatGroup.json`, `paymentCard`, bodySet.paymentCard);
                }

                // set chat id group paymentBank
                if (void 0 !== bodySet.paymentBank && bodySet.paymentBank) {
                    setJsonConfig(`${_SRC_PATH}/configs/telegram/chatGroup.json`, `paymentBank`, bodySet.paymentBank);
                }

                // set chat id group paymentWithdraw
                if (void 0 !== bodySet.paymentWithdraw && bodySet.paymentWithdraw) {
                    setJsonConfig(`${_SRC_PATH}/configs/telegram/chatGroup.json`, `paymentWithdraw`, bodySet.paymentWithdraw);
                }

                // set chat content paymentCard
                if (void 0 !== bodySet.paymentCardContent && bodySet.paymentCardContent) {
                    setJsonConfig(`${_SRC_PATH}/configs/telegram/message.json`, `paymentCard`, bodySet.paymentCardContent);
                }

                // set chat content paymentBank
                if (void 0 !== bodySet.paymentBankContent && bodySet.paymentBankContent) {
                    setJsonConfig(`${_SRC_PATH}/configs/telegram/message.json`, `paymentBank`, bodySet.paymentBankContent);
                }

                // set chat content paymentWithdraw
                if (void 0 !== bodySet.paymentWithdrawContent && bodySet.paymentWithdrawContent) {
                    setJsonConfig(`${_SRC_PATH}/configs/telegram/message.json`, `paymentWithdraw`, bodySet.paymentWithdrawContent);
                }

                if (!await setConfigFromDB(ConfigModel.KEY_ENUM.TELEGRAM_BOT, getJsonConfig(`${_SRC_PATH}/configs/telegram/bot.json`))) {
                    return res.status(200).json({
                        status: false,
                        msg: ERROR_SERVER,
                        code: 500
                    });
                }

                if (!await setConfigFromDB(ConfigModel.KEY_ENUM.TELEGRAM_CHAT_GROUP, getJsonConfig(`${_SRC_PATH}/configs/telegram/chatGroup.json`))) {
                    return res.status(200).json({
                        status: false,
                        msg: ERROR_SERVER,
                        code: 500
                    });
                }

                if (!await setConfigFromDB(ConfigModel.KEY_ENUM.TELEGRAM_MESSAGE, getJsonConfig(`${_SRC_PATH}/configs/telegram/message.json`))) {
                    return res.status(200).json({
                        status: false,
                        msg: ERROR_SERVER,
                        code: 500
                    });
                }

                return res.status(200).json({
                    status: true,
                    msg: SUCCESS,
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
        },
    }
};
