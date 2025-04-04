const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const {
    ERROR_PAGE,
    ERROR_FORM,
    ERROR_AUTH,
    ERROR_AUTH_MESSAGE,
    ERROR_MESSAGES
} = require("@Helpers/contants");
const Helper = require("@Helpers/helpers");
const { parseInt } = require("@Helpers/Number");
const {
    findByUsername,
    findByEmail,
    findByID,
    UserModel
} = require("@Models/User/User");
const { AgencyModel } = require("@Models/Agency/Agency");
const { AgencyRefModel } = require("@Models/Agency/AgencyRef");
const {
    getTheAgencyLevel,
    getCurrentUserList,
    getCurrentAgencyList
} = require("@Models/Agency/AgencyHelper");
const { BankUserModel } = require("@Models/Bank/BankUser");
const { BankHistoryModel } = require("@Models/Bank/BankHistory");
const { BetHistoryModel } = require("@Models/Bet/BetHistory");

let getStartEndOfDate = (type, time, day) => {
    return (type == "start") ? moment(time.subtract(day, "days")).startOf('day') : moment(time.subtract(day, "days")).endOf('day');
}

module.exports = {
    getLevelListAgency: async (req, res) => {
        try {
            const masterAgentId = req.params.id;

            res.status(200).json(await getCurrentAgencyList(masterAgentId, true));
        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: false,
                msg: e.message,
                code: 500
            });
        }
    },
    listAgency: async (req, res) => {
        try {
            const page = parseInt(req.query.page, true)
                ? parseInt(req.query.page, true)
                : 0;
            const kmess = parseInt(req.query.limit, true)
                ? parseInt(req.query.limit, true)
                : 0;

            if (!!page && !!kmess) {
                let match = {};
                let assocScopes = [];

                // add condition agency = curent agency id
                match.agency = req.agency.id;

                // const getTheAgencyLevelLine =

                // filter
                if (!!req.query.name) {
                    assocScopes.push({ method: ['bySearchName', req.query.name] });
                }
                if (!!req.query.username) {
                    assocScopes.push({ method: ['bySearchUsername', req.query.username] });
                }
                if (!!req.query.phone) {
                    assocScopes.push({ method: ['bySearchPhone', req.query.phone] });
                }
                if (!!req.query.email) {
                    assocScopes.push({ method: ['bySearchEmail', req.query.email] });
                }
                if (!!req.query.code) {
                    //assocScopes.push({ method: ['byAgencyCode', req.query.code] });
                }

                assocScopes.push(
                    { method: ['withUserInfo'] },
                    { method: ['withRoleAgency'] },
                    //{ method: ['withRoleUser'] }
                );

                const total = await AgencyRefModel.scope(assocScopes).count({ where: match });

                let getUsers = await AgencyRefModel.scope(assocScopes).findAll({
                    where: match,
                    offset: 0 + (page - 1) * kmess,
                    limit: kmess,
                    order: [["id", "ASC"]],
                    attributes: { exclude: ["password", "deletedAt"] },
                });

                var i = 1;
                for (const user of getUsers) {
                    user.setDataValue('level', i);
                    user.setDataValue('AgencyInfo', await AgencyModel.findOne({ where: { uid: user.userInfo.id } }));
                };

                res.status(200).json({
                    status: true,
                    data: {
                        dataExport: getUsers,
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
    listAgencyByAgencyId: async (req, res) => {
        try {
            const page = parseInt(req.query.page, true)
                ? parseInt(req.query.page, true)
                : 0;
            const kmess = parseInt(req.query.limit, true)
                ? parseInt(req.query.limit, true)
                : 0;

            if (!!page && !!kmess) {
                let match = {};
                let assocScopes = [];
                // add condition agency = curent agency id
                match.agency = req.params.agencyId;

                // const getTheAgencyLevelLine =

                // filter
                if (!!req.query.name) {
                    assocScopes.push({ method: ['bySearchName', req.query.name] });
                }
                if (!!req.query.username) {
                    assocScopes.push({ method: ['bySearchUsername', req.query.username] });
                }
                if (!!req.query.phone) {
                    assocScopes.push({ method: ['bySearchPhone', req.query.phone] });
                }
                if (!!req.query.email) {
                    assocScopes.push({ method: ['bySearchEmail', req.query.email] });
                }
                if (!!req.query.code) {
                    //assocScopes.push({ method: ['byAgencyCode', req.query.code] });
                }

                assocScopes.push(
                    { method: ['withUserInfo'] },
                    { method: ['withRoleAgency'] },
                    //{ method: ['withRoleUser'] }
                );

                const total = await AgencyRefModel.scope(assocScopes).count({ where: match });

                let getUsers = await AgencyRefModel.scope(assocScopes).findAll({
                    where: match,
                    offset: 0 + (page - 1) * kmess,
                    limit: kmess,
                    order: [["id", "ASC"]],
                    attributes: { exclude: ["password", "deletedAt"] },
                });

                var i = 1;
                for (const user of getUsers) {
                    user.setDataValue('level', i);
                    user.setDataValue('AgencyInfo', await AgencyModel.findOne({ where: { uid: user.userInfo.id } }));
                };

                res.status(200).json({
                    status: true,
                    data: {
                        dataExport: getUsers,
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
    deleteAgency: async (req, res) => {
        try {
            return res.status(200).json({
                status: false,
                msg: "Hành động không được phép!"
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
    AgencyInfo: async (req, res) => {
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

            //withAgencyInfo
            const user = await UserModel.scope({ method: ['withAgencyInfo'] }).findOne({
                where: { id, role: UserModel.ROLE_ENUM.AGENCY },
                attributes: { exclude: ["password", "role", "deletedAt"] },
                include: [
                    {
                        model: BankUserModel,
                        as: "BankUser",
                        attributes: { exclude: ["deletedAt"] }
                    }
                ]
            });

            if (!!user) {
                return res.status(200).json({
                    status: true,
                    data: user,
                    msg: "success"
                });
            } else {
                return res.status(200).json({
                    status: false,
                    msg: "Agency not found!"
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
    listUsername: async (req, res) => {
        try {
            let match = {};
            match.role = UserModel.ROLE_ENUM.USER;
            if (!!req.query.username) {
                match.username = { [Op.like]: `%${req.query.username}%` };
            }

            const getUsers = await UserModel.findAll({
                where: match,
                order: Sequelize.literal("rand()"),
                attributes: ["username"]
            });

            const dataExport = [];
            getUsers.forEach((user) => dataExport.push(user.username));

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
    },
    countRefererUser: async (req, res) => {
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
            const agencyData = await AgencyModel.findOne({
                where: { uid: id },
            });
            const countRefUser = await AgencyRefModel.count({
                where: {
                    agency: agencyData.id
                }
            });

            res.status(200).json({
                status: true,
                count: countRefUser,
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
    countRefererUserToday: async (req, res) => {
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
            const agencyData = await AgencyModel.findOne({
                where: { uid: id },
            });
            const countRefUser = await AgencyRefModel.count({
                where: {
                    agency: agencyData.id,
                    createdAt: {
                        [Op.between]: [moment().startOf('days').format(), moment().endOf('days').format()]
                    }
                },
            });

            res.status(200).json({
                status: true,
                count: countRefUser,
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
    calculatorProfit: async (req, res) => {
        try {
            let { id } = req.params;
            let { from, to } = req.query;

            let timeStart, timeEnd;
            if (!!from && !!to) {
                timeStart = moment(from, "DD/MM/YYYY").startOf('day');
                timeEnd = moment(to, "DD/MM/YYYY").endOf('day');
            } else {
                timeStart = moment().startOf('day');
                timeEnd = moment().endOf('day');
            }


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

            const agencyData = await AgencyModel.findOne({
                where: { uid: id },
                include: [
                    {
                        model: UserModel,
                        as: "userInfo",
                        attributes: { exclude: ["password", "id", "deletedAt", "code", "status", "role", "updatedAt"] },
                    }
                ]
            });


            const totalUsers = await AgencyRefModel.findAll({
                where: { agency: agencyData.id },
                include: [
                    {
                        model: UserModel.scope('withRoleUser'),
                        as: "userInfo",
                        attributes: { exclude: ["password", "id", "deletedAt", "code", "status", "role", "updatedAt"] },
                        require: false
                    }
                ]
            });

            let totalUserRefCoin = 0;
            totalUsers.forEach((refUser) => totalUserRefCoin += refUser.userInfo.coin);

            const listUserRef = await getCurrentAgencyList(agencyData.id);

            let taskPromise = [];
            let listUserDownline = [];
            for (const userId of listUserRef) taskPromise.push(UserModel.findOne({ where: { id: userId }, attributes: { exclude: ["password", "deletedAt", "code", "status", "updatedAt"] }, }));
            const getListUserDownline = await Promise.allSettled(taskPromise);
            for (const userPromise of getListUserDownline) {
                if (userPromise.status == "fulfilled") {
                    listUserDownline.push(userPromise.value);
                }
            }

            let exportData = [];
            let arrCursor = 0;

            for (var userRef of listUserDownline) {
                exportData[arrCursor] = {};

                exportData[arrCursor].userInfo = userRef;

                let match = {};
                match.uid = userRef.id;
                match.createdAt = {
                    [Op.between]: [timeStart.format(), timeEnd.format()]
                }

                const getBetRecord = await BetHistoryModel.findAll({
                    where: match,
                    attributes: {
                        exclude: ['uid', 'username', 'updatedAt', 'deletedAt']
                    },
                    order: [["id", "DESC"]],
                });
                exportData[arrCursor].betRecord = getBetRecord;

                // chỉ lấy record success
                match.status = BankHistoryModel.STATUS_ENUM.SUCCESS;

                match.type = BankHistoryModel.TYPE_ENUM.RECHARGE;
                const getDepositRecord = await BankHistoryModel.findAll({
                    where: match,
                    attributes: ['amount', 'createdAt'],
                    order: [["id", "DESC"]],
                });
                exportData[arrCursor].depositRecord = getDepositRecord;

                match.type = BankHistoryModel.TYPE_ENUM.CASHOUT;
                const getWithdrawRecord = await BankHistoryModel.findAll({
                    where: match,
                    attributes: ['amount', 'createdAt'],
                    order: [["id", "DESC"]],
                });
                exportData[arrCursor].withdrawRecord = getWithdrawRecord;

                arrCursor++;
            }

            res.status(200).json({
                status: true,
                agency: agencyData,
                totalUsers,
                totalUserRefCoin,
                data: exportData,
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
    Action: {
        update: async (req, res) => {
            return res.status(200).json({
                status: false,
                msg: "Hành động không được phép!"
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

                const { name, username, code, email, phone, coin, status, verify, role } = req.body;

                const user = await findByID(id);
                if (!!user) {
                    user.isPlay = UserModel.IS_PLAY_ENUM.FALSE;
                    user.name = name;
                    user.username = username;
                    user.email = email;
                    user.phone = phone;
                    user.coin = coin;
                    user.status = status;
                    user.verify = verify;
                    if (role == UserModel.ROLE_ENUM.USER || role == UserModel.ROLE_ENUM.AGENCY) user.role = role;

                    await user.save();
                    await user.reload();

                    const agency = await AgencyModel.findOne({
                        where: { uid: user.id }
                    });

                    if (!!agency) {
                        agency.code = code;
                        await agency.save();
                        await agency.reload();
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
        }
    }
};
