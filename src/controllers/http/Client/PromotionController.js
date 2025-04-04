const {
    ERROR_PAGE,
    ERROR_FORM,
    ERROR_AUTH,
    ERROR_AUTH_MESSAGE,
    ERROR_MESSAGES,
    ERROR_SERVER,
    SUCCESS
} = require("@Helpers/contants");
const { PromotionModel } = require("@Models/Promotion/Promotion");
const { PromotionRegisterModel } = require("@Models/Promotion/PromotionRegister");

module.exports = {
    default: async (req, res) => {
        try {
            const getData = await PromotionModel.findAll({
                where: {},
                order: [["id", "DESC"]],
                attributes: { exclude: ["deletedAt", "content"] }
            });

            res.status(200).json({
                status: true,
                data: getData,
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
    promotionInfo: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(200).json({
                    status: false,
                    msg: "Missing Param ID"
                });
            }

            if (!Number(id) >> 0) {
                return res.status(200).json({
                    status: false,
                    msg: "Err ID"
                });
            }

            const promotion = await PromotionModel.findOne({
                where: { id },
                attributes: { exclude: ["deletedAt"] }
            });

            if (!!promotion) {
                return res.status(200).json({
                    status: true,
                    data: promotion,
                    msg: "success"
                });
            } else {
                return res.status(200).json({
                    status: false,
                    msg: "Khuyến mãi không tồn tại!"
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
    },
    promotionCheckRegister: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(200).json({
                    status: false,
                    msg: "Missing Param ID"
                });
            }

            if (!Number(id) >> 0) {
                return res.status(200).json({
                    status: false,
                    msg: "Err ID"
                });
            }

            const promotion = await PromotionRegisterModel.findOne({
                where: {
                    uid: req.user.id,
                    promotion: id
                },
                attributes: { exclude: ["deletedAt"] }
            });

            if (!!promotion) {
                return res.status(200).json({
                    status: true,
                    promotion: id,
                    user: req.user.id
                });
            } else {
                return res.status(200).json({
                    status: false,
                    promotion: id,
                    user: req.user.id
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
    },
    promotionRegister: async (req, res) => {
        try {
            const { id } = req.params;
            const { type } = req.body;

            if (!id || !type) {
                return res.status(200).json({
                    status: false,
                    msg: "Missing Params"
                });
            }

            if (!Number(id) >> 0) {
                return res.status(200).json({
                    status: false,
                    msg: "Err ID"
                });
            }

            const promotion = await PromotionModel.findOne({
                where: { id },
                attributes: { exclude: ["deletedAt"] }
            });

            if (!promotion) {
                return res.status(200).json({
                    status: false,
                    msg: "Khuyến mãi không tồn tại!"
                });
            }

            if (type == "cancel") {
                const userRegPromotion = await PromotionRegisterModel.findOne({
                    where: {
                        uid: req.user.id,
                        promotion: promotion.id
                    }
                });

                if (!userRegPromotion) {
                    return res.status(200).json({
                        status: false,
                        msg: "Bạn chưa tham gia khuyến mãi này!"
                    });
                }

                const cancelRegister = await PromotionRegisterModel.destroy({
                    where: {
                        uid: req.user.id,
                        promotion: promotion.id
                    },
                    force: true
                });

                if (!!cancelRegister) {
                    return res.status(200).json({
                        status: true,
                        data: null,
                        msg: "Success"
                    });
                } else {
                    return res.status(200).json({
                        status: false,
                        msg: "Err Cancel Promotion!"
                    });
                }
            } else if (type == "register") {
                const userRegPromotion = await PromotionRegisterModel.findOne({
                    where: {
                        uid: req.user.id,
                        promotion: promotion.id
                    }
                });

                if (!!userRegPromotion) {
                    return res.status(200).json({
                        status: false,
                        msg: "Bạn đã tham gia khuyến mãi này rồi!"
                    });
                }

                const createRegister = await PromotionRegisterModel.create({
                    uid: req.user.id,
                    promotion: promotion.id
                });

                if (!!createRegister) {
                    return res.status(200).json({
                        status: true,
                        data: null,
                        msg: "Success"
                    });
                } else {
                    return res.status(200).json({
                        status: false,
                        msg: "Err Register Promotion!"
                    });
                }
            }
        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: false,
                msg: e.message,
                code: 500
            });
        }
    },
};