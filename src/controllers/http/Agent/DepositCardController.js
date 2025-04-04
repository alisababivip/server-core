const { Op } = require("sequelize");
const {
    ERROR_PAGE,
    ERROR_FORM,
    ERROR_AUTH,
    ERROR_AUTH_MESSAGE,
    ERROR_MESSAGES
} = require("@Helpers/contants");
const Helper = require("@Helpers/helpers");
const { parseInt } = require("@Helpers/Number");
const { findByID, UserModel } = require("@Models/User/User");
const { CardHistoryModel } = require("@Models/Card/CardHistory");

module.exports = {
    listDeposit: async (req, res) => {
        try {
            const page = parseInt(req.query.page, true)
                ? parseInt(req.query.page, true)
                : 0;
            const kmess = parseInt(req.query.limit, true)
                ? parseInt(req.query.limit, true)
                : 0;

            if (!!page && !!kmess) {
                let match = {};
                match.type = CardHistoryModel.TYPE_ENUM.RECHARGE;

                // filter
                if (!!req.query.network) {
                    match.network = { [Op.like]: `%${req.query.network}%` };
                }
                if (!!req.query.pin) {
                    match.pin = { [Op.like]: `%${req.query.pin}%` };
                }
                if (!!req.query.seri) {
                    match.seri = { [Op.like]: `%${req.query.seri}%` };
                }
                if (!!req.query.transId) {
                    match.transId = req.query.transId;
                }
                if (!!req.query.amount) {
                    match.amount = req.query.amount;
                }
                if (!!req.query.status) {
                    match.status = req.query.status;
                }

                const total = await CardHistoryModel.count({ where: match });
                const getData = await CardHistoryModel.findAll({
                    where: match,
                    offset: 0 + (page - 1) * kmess,
                    limit: kmess,
                    order: [["id", "DESC"]],
                    attributes: { exclude: ["deletedAt", "type"] },
                    include: [
                        {
                            model: UserModel,
                            as: "userInfo",
                            attributes: { exclude: ["password", "id", "role", "deletedAt"] }
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
    deleteDeposit: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(200).json({
                    status: false,
                    msg: "Missing Param Bank ID"
                });
            }

            if (!Number(id) >> 0) {
                return res.status(200).json({
                    status: false,
                    msg: "Err Bank ID"
                });
            }

            const bank = await CardHistoryModel.findOne({ where: { id } });

            if (!!bank) {
                const deleteBankDeposit = await CardHistoryModel.destroy({
                    where: { id: bank.id },
                    force: true
                });

                if (!!deleteBankDeposit) {
                    return res.status(200).json({
                        status: true,
                        data: null,
                        msg: "Success"
                    });
                } else {
                    return res.status(200).json({
                        status: false,
                        msg: "Err Delete Bank Deposit"
                    });
                }
            } else {
                return res.status(200).json({
                    status: false,
                    msg: "Bank not found"
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
    depositInfo: async (req, res) => {
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

            const deposit = await CardHistoryModel.findOne({
                where: { id, type: CardHistoryModel.TYPE_ENUM.RECHARGE },
                attributes: { exclude: ["deletedAt", "type"] },
                include: [
                    {
                        model: UserModel,
                        as: "userInfo",
                        attributes: { exclude: ["password", "id", "role", "deletedAt"] }
                    }
                ]
            });

            if (!!deposit) {
                return res.status(200).json({
                    status: true,
                    data: deposit,
                    msg: "success"
                });
            } else {
                return res.status(200).json({
                    status: false,
                    msg: "Deposit not found"
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

                const deposit = await CardHistoryModel.findOne({
                    where: { id, type: CardHistoryModel.TYPE_ENUM.RECHARGE },
                    attributes: { exclude: ["deletedAt", "type"] }
                });
                const user = await findByID(deposit.uid);

                if (!!deposit && !!user) {
                    if (deposit.status !== status) {
                        if (status === CardHistoryModel.STATUS_ENUM.SUCCESS) {
                            // Thành công
                            user.coin += Number(deposit.amount);
                            // set lại trạng thái đã chơi tránh trường hợp vừa nạp tiền xong đã bị về 0
                            user.isPlay = UserModel.IS_PLAY_ENUM.FALSE;
                        }
                    }

                    deposit.status = status;
                    await deposit.save();
                    await deposit.reload();
                    await user.save();
                    await user.reload();

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
        }
    }
};
