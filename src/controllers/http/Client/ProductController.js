const {
    ERROR_PAGE,
    ERROR_FORM,
    ERROR_AUTH,
    ERROR_AUTH_MESSAGE,
    ERROR_MESSAGES
} = require("@Helpers/contants");
const Helper = require("@Helpers/helpers");
const { parseInt } = require("@Helpers/Number");
const redis = require("@Databases/redis");
const TcgService = require("@Plugins/TcgService");
const subnamesConfig = require("@Configs/game/subnamesConfig.json");
const gameConfig = require("@Configs/game/gameConfig.json");

module.exports = {
    index: async (req, res) => {
        try {
            res.status(200).json({
                status: true,
                msg: "success",
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
    category: async (req, res) => {
        try {
            const gameTypeConfig = ["RNG", "FISH", "LIVE", "PVP", "SPORTS", "ELOTT", "CHESS"];
            const { productType, gameType } = req.params;
            if (!productType || !gameType) return res.status(200).json({ status: false, msg: "Error Missing Param!" });
            if (!subnamesConfig.includes(productType.toUpperCase())) return res.status(200).json({ status: false, msg: "Nhà cung cấp trò chơi này hiện tại không khả dụng! Xin trân thành xin lỗi quý khách hàng vì sự thiếu sót này." });
            if (!gameConfig.hasOwnProperty(productType.toUpperCase())) return res.status(200).json({ status: false, msg: "Nhà cung cấp trò chơi này hiện tại không khả dụng! Xin trân thành xin lỗi quý khách hàng vì sự thiếu sót này." });
            if (!gameTypeConfig.includes(gameType.toUpperCase())) return res.status(200).json({ status: false, msg: "Nhà cung cấp trò chơi này hiện tại không khả dụng! Xin trân thành xin lỗi quý khách hàng vì sự thiếu sót này." });

            const getConfig = Helper.getConfigGameByProduct(productType.toUpperCase(), gameType.toLowerCase());

            if (!!getConfig) {
                let dataExport = {
                    status: 0,
                    games: [],
                    error_desc: null
                };

                for (const [key, value] of Object.entries(getConfig)) {
                    dataExport.games.push({
                        displayStatus: 0,
                        gameType: gameType.toUpperCase(),
                        gameName: value.name,
                        tcgGameCode: key,
                        productCode: productType.toUpperCase(),
                        productType: gameConfig[productType.toUpperCase()].type,
                        platform: "html5,html5-desktop",
                        gameSubType: "PVP",
                        trialSupport: false,
                        icon: value.icon
                    });
                }

                res.status(200).json({
                    status: true,
                    data: dataExport
                });
            } else {
                const redisKey = `getListGame:${productType.toUpperCase()}:${gameType.toUpperCase()}`;
                const checkRedis = await redis.get(redisKey);

                if (!checkRedis) {
                    const tcgService = new TcgService(Helper.getValueOfKeyObject(TcgConfig, gameConfig[productType.toUpperCase()].config));

                    const getGameList = await tcgService.getGameList(
                        gameConfig[productType.toUpperCase()].type,
                        "html5",
                        "web",
                        gameType.toUpperCase()
                    );
                    redis.set(redisKey, {
                        status: true,
                        data: getGameList
                    });
                    res.status(200).json({
                        status: true,
                        data: getGameList
                    });
                } else {
                    res.status(200).json(checkRedis);
                }
            }
        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: true
            });
        }
    },
    fish: async (req, res) => {
        try {
            const getConfig = Helper.getConfigGameByProduct("ALL", "fish");
            res.status(200).json({
                status: true,
                data: getConfig
            });
        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: true
            });
        }
    },
};
