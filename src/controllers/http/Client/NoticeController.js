const {
    ERROR_PAGE,
    ERROR_FORM,
    ERROR_AUTH,
    ERROR_AUTH_MESSAGE,
    ERROR_MESSAGES
} = require("@Helpers/contants");
const { parseInt } = require("@Helpers/Number");
const { findByID, findByUsername, UserModel } = require("@Models/User/User");
const { MessageModel } = require("@Models/Message/Message");

module.exports = {
    listMessage: async (req, res) => {
        try {
            let match = {};
            match.uid = req.user.id;
            const limitRate = 10;

            const getData = await MessageModel.findAll({
                where: match,
                order: [["id", "DESC"]],
                limit : limitRate,
                attributes: { exclude: ["deletedAt"] }
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
    deleteMessage: async (req, res) => {
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

            const message = await MessageModel.findOne({ where: { id } });

            if (!!message) {
                const deleteMessage = await MessageModel.destroy({
                    where: { id: message.id },
                    force: true
                });

                if (!!deleteMessage) {
                    return res.status(200).json({
                        status: true,
                        data: null,
                        msg: "Success"
                    });
                } else {
                    return res.status(200).json({
                        status: false,
                        msg: "Err Delete Message"
                    });
                }
            } else {
                return res.status(200).json({
                    status: false,
                    msg: "Message not found"
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
    messageInfo: async (req, res) => {
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

            const message = await MessageModel.findOne({
                where: { id, uid: req.user.id },
                attributes: { exclude: ["deletedAt"] }
            });

            if (!!message) {
                return res.status(200).json({
                    status: true,
                    data: message,
                    msg: "success"
                });
            } else {
                return res.status(200).json({
                    status: false,
                    msg: "message not found"
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
        seen: async (req, res) => {
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

                const annoucement = await MessageModel.findOne({
                    where: { id, uid: req.user.id }
                });

                if (!!annoucement) {
                    annoucement.seen = true;
                    annoucement.save();
                    annoucement.reload();

                    res.status(200).json({
                        status: true,
                        msg: "Cập nhật thành công!",
                        code: 200
                    });
                } else {
                    res.status(200).json({
                        status: false,
                        msg: "Not Found",
                        code: 500
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
        count: async (req, res) => {
            try {
                const countAnnoucement = await MessageModel.count({
                    where: {
                        uid: req.user.id,
                        seen: false
                    }
                });

                res.status(200).json({
                    status: true,
                    count: countAnnoucement,
                    msg: "Success",
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
        }
    }
};
