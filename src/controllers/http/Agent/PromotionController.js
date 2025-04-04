const { Op } = require("sequelize");
const {
    ERROR_PAGE,
    ERROR_FORM,
    ERROR_AUTH,
    ERROR_AUTH_MESSAGE,
    ERROR_MESSAGES
} = require("@Helpers/contants");
const { parseInt } = require("@Helpers/Number");
const { findByID, findByUsername, UserModel } = require("@Models/User/User");
const { BankHistoryModel } = require("@Models/Bank/BankHistory");
const BankListDeposit = require("@Configs/payment/BankDeposit.json");
const { BankUserModel } = require("@Models/Bank/BankUser");
const { MessageModel } = require("@Models/Message/Message");
const { PromotionModel } = require("@Models/Promotion/Promotion");
const { PromotionRegisterModel } = require("@Models/Promotion/PromotionRegister");
const { getCurrentAgencyList } = require("@Models/Agency/AgencyHelper");

module.exports = {
    listPromotion: async (req, res) => {
        try {
            const page = parseInt(req.query.page, true)
                ? parseInt(req.query.page, true)
                : 0;
            const kmess = parseInt(req.query.limit, true)
                ? parseInt(req.query.limit, true)
                : 0;

            if (!!page && !!kmess) {
                let match = {};
                //match.type = PromotionModel.IS_REGISTER_ENUM.YES;

                // filter
                if (!!req.query.title) {
                    match.title = { [Op.like]: `%${req.query.title}%` };
                }
                if (!!req.query.thumbnail) {
                    match.thumbnail = { [Op.like]: `%${req.query.thumbnail}%` };
                }
                if (!!req.query.content) {
                    match.content = { [Op.like]: `%${req.query.content}%` };
                }
                if (!!req.query.isRegister) {
                    match.isRegister = (req.query.isRegister == true) ? PromotionModel.IS_REGISTER_ENUM.YES : PromotionModel.IS_REGISTER_ENUM.NO;
                }

                const myRefUserList = await getCurrentAgencyList(req.agency.id);

                const total = await PromotionModel.count({ where: match });
                const getData = await PromotionModel.findAll({
                    where: match,
                    offset: 0 + (page - 1) * kmess,
                    limit: kmess,
                    order: [["id", "DESC"]],
                    attributes: { exclude: ["deletedAt"] },
                    include: [
                        {
                            model: PromotionRegisterModel,
                            as: "promotionRegisterInfo",
                            attributes: { exclude: ["deletedAt"] },
                            where: { uid: myRefUserList },
                            required: false,
                        }
                    ]
                });

                res.status(200).json({
                    status: true,
                    data: {
                        dataExport: getData,
                        page: page,
                        kmess: kmess,
                        total: total
                    },
                    msg: "SUCCESS"
                });
            } else {
                res.status(200).json({
                    status: false,
                    msg: ERROR_FORM.MISSING_FIELD
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
    deletePromotion: async (req, res) => {
        return res.status(200).json({
            status: false,
            msg: "Hành động không được phép!",
            code: 400
        });
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

            const promotion = await PromotionModel.findOne({ where: { id } });

            if (!!promotion) {
                const deletePromotion = await PromotionModel.destroy({
                    where: { id: promotion.id },
                    force: true
                });

                if (!!deletePromotion) {
                    return res.status(200).json({
                        status: true,
                        data: null,
                        msg: "Success"
                    });
                } else {
                    return res.status(200).json({
                        status: false,
                        msg: "Err Delete promotion"
                    });
                }
            } else {
                return res.status(200).json({
                    status: false,
                    msg: "promotion not found"
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
                    msg: "Promotion not found"
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
    promotionRegisted: async (req, res) => {
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

                const myRefUserList = await getCurrentAgencyList(req.agency.id);
                const getListRegister = await PromotionRegisterModel.findAll({
                    where: { promotion: promotion.id, uid: myRefUserList },
                    attributes: { exclude: ["updatedAt", "deletedAt"] },
                    include: [
                        {
                            model: UserModel,
                            as: "userInfo",
                            attributes: { exclude: ["password", "deletedAt", "code", "status", "updatedAt"] }
                        }
                    ]
                });
                return res.status(200).json({
                    status: true,
                    data: getListRegister,
                    msg: "success"
                });
            } else {
                return res.status(200).json({
                    status: false,
                    msg: "Promotion not found"
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
    Action: {
        update: async (req, res) => {
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

                const { status } = req.body;

                const withdraw = await BankHistoryModel.findOne({
                    where: { id, type: BankHistoryModel.TYPE_ENUM.CASHOUT },
                    attributes: { exclude: ["deletedAt", "type"] }
                });
                const user = await findByID(withdraw.uid);

                if (!!withdraw && !!user) {
                    if (withdraw.status !== status) {
                        if (status === BankHistoryModel.STATUS_ENUM.ERROR) {
                            // trả lại tiền
                            user.coin += Number(withdraw.amount);
                            withdraw.status = status;
                            withdraw.save();
                            withdraw.reload();
                        } else if (withdraw.status === BankHistoryModel.STATUS_ENUM.ERROR) {
                            // trừ tiền
                            user.coin -= Number(withdraw.amount);
                            withdraw.status = status;
                            withdraw.save();
                            withdraw.reload();
                        }
                        user.save();
                        user.reload();
                    }

                    if (status == 1) {
                        // rút thủ công
                        withdraw.status = status;
                        withdraw.save();
                    }

                    res.status(200).json({
                        status: true,
                        msg: "Cập nhật thành công!",
                        code: 200
                    });
                } else {
                    res.status(200).json({
                        status: false,
                        msg: "User not found!",
                        code: 400
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
        create: async (req, res) => {
            return res.status(200).json({
                status: false,
                msg: "Hành động không được phép!",
                code: 400
            });
            try {
                const { title, thumbnail, content, isRegister } = req.body;
                console.log(req.body);

                const createPromotion = await PromotionModel.create({
                    title,
                    thumbnail,
                    content,
                    isRegister: (isRegister == true) ? PromotionModel.IS_REGISTER_ENUM.YES : PromotionModel.IS_REGISTER_ENUM.NO
                });

                if (!!createPromotion) {
                    res.status(200).json({
                        status: true,
                        data: createPromotion,
                        msg: "Tạo khuyến mãi thành công!",
                        code: 200
                    });
                } else {
                    res.status(200).json({
                        status: false,
                        msg: "Can't create Promotion!",
                        code: 400
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
        }
    }
};
