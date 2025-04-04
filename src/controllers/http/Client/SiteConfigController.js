const {
    ERROR_PAGE,
    ERROR_FORM,
    ERROR_AUTH,
    ERROR_AUTH_MESSAGE,
    ERROR_MESSAGES
} = require("@Helpers/contants");
const redis = require("@Databases/redis");
const {
    ConfigModel,
    getConfigFromDB,
    setConfigFromDB } = require("@Models/Configs/Configs");

module.exports = {
    infomation: async (req, res) => {
        try {
            let dataExport = {};
            const keyCache = `server_site_infomation`;
            const redisData = await redis.get(keyCache);
            if (!redisData) {
                const siteInfomation = await getConfigFromDB(ConfigModel.KEY_ENUM.SITE_INFOMATION);
                redis.set(keyCache, siteInfomation.value);
                dataExport = siteInfomation.value;
            } else {
                dataExport = redisData;
            }

            res.status(200).json({
                status: true,
                data: dataExport,
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
