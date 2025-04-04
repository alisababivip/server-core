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
const { generatePassword } = require("@Helpers/password");
const {
    findByUsername,
    findByEmail,
    findByID,
    UserModel
} = require("@Models/User/User");
const { AgencyModel } = require("@Models/Agency/Agency");
const { AgencyRefModel } = require("@Models/Agency/AgencyRef");
const { BankUserModel } = require("@Models/Bank/BankUser");
const { BankHistoryModel } = require("@Models/Bank/BankHistory");
const { BetHistoryModel } = require("@Models/Bet/BetHistory");
const gameConfig = require("@Configs/game/gameConfig.json");
const {
    getTotalBalance,
    resetBalanceToZero,
    backupBalanceByUser
} = require("@Services/TcgService/helpers");

const {
    getLevelOfAgency,
    getCurrentAgencyList,
    getCurrentUserList,
    getUserAndAgencyList,
    getCurrentTreeArrayByAgency
} = require("@Models/Agency/AgencyHelper");

const listToTree = require("@Helpers/listToTree");

let getStartEndOfDate = (type, time, day) => {
    return (type == "start") ? moment(time.subtract(day, "days")).startOf('day') : moment(time.subtract(day, "days")).endOf('day');
}


module.exports = {
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
                match.role = UserModel.ROLE_ENUM.AGENCY;

                const from = (req.query.from) ? req.query.from : moment().startOf("year").format("DD/MM/YYYY");
                const to = (req.query.to) ? req.query.to : moment().format("DD/MM/YYYY");
				// match.createdAt = {
				// 	[Op.between]: [moment(from, "DD/MM/YYYY").startOf("days").format(), moment(to, "DD/MM/YYYY").endOf("days").format()]
				// };

                
                // filter
                if (!!req.query.name) {
                    match.name = { [Op.like]: `%${req.query.name}%` };
                }
                if (!!req.query.username) {
                    match.username = req.query.username;
                }
                if (!!req.query.phone) {
                    match.phone = req.query.phone;
                }
                if (!!req.query.email) {
                    match.email = req.query.email;
                }
                if (!!req.query.code) {
                    assocScopes.push({ method: ['byAgencyCode', req.query.code] });
                }

                const total = await UserModel.scope(assocScopes).count({ where: match });

                const getUsers = await UserModel.scope(assocScopes).findAll({
                    where: match,
                    offset: 0 + (page - 1) * kmess,
                    limit: kmess,
                    order: [["id", "DESC"]],
                    attributes: { exclude: ["password", "deletedAt"] },
                    include: [
                        {
                            model: AgencyModel,
                            as: "AgencyInfo",
                            required: false
                        },
                    ],
                    raw: true,
                    nest: true
                });

                let dataExport = [];

                for (const userData of getUsers) {
                    let cacheUserData = userData;
                    cacheUserData.agencyLevel = await getLevelOfAgency(userData.id);
                    //cacheUserData.agencyLevel = null;
                    cacheUserData.totalDeposit = 0;
                    cacheUserData.totalWithdraw = 0;

                    const getBankHistory = await BankHistoryModel.findAll({
                        where: {
                            uid: userData.id,
                            status: BankHistoryModel.STATUS_ENUM.SUCCESS
                        },
                        attributes: ["type", "amount"]
                    });

                    getBankHistory.forEach((item) => {
                        if (item.type == BankHistoryModel.TYPE_ENUM.RECHARGE) cacheUserData.totalDeposit += item.amount;
                        if (item.type == BankHistoryModel.TYPE_ENUM.CASHOUT) cacheUserData.totalWithdraw += item.amount;
                    });

                    dataExport.push(cacheUserData);
                };

                res.status(200).json({
                    status: true,
                    data: {
                        dataExport,
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

            const user = await UserModel.findOne({ where: { id } });

            if (!!user) {
                // reset tất cả tiền tcg
                // const balanceTcgRecovery = await resetBalanceToZero(user.username);
                const balanceTcgRecovery =  null;


                const deleteUser = await UserModel.destroy({
                    where: { id: user.id },
                    force: true
                });

                if (!!deleteUser) {
                    return res.status(200).json({
                        status: true,
                        data: null,
                        msg: "Success"
                    });
                } else {
                    return res.status(200).json({
                        status: false,
                        msg: "Err Delete User"
                    });
                }
            } else {
                return res.status(200).json({
                    status: false,
                    msg: "User not found"
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
                        attributes: { exclude: ["deletedAt"] },
                        required: false
                    }
                ]
            });

            if (!!user) {
                let dataExport = user.toJSON();
                dataExport.totalDeposit = 0;
                dataExport.totalWithdraw = 0;

                const getBankHistory = await BankHistoryModel.findAll({
                    where: {
                        uid: user.id,
                        status: BankHistoryModel.STATUS_ENUM.SUCCESS
                    },
                    attributes: ["type", "amount"]
                });

                getBankHistory.forEach((item) => {
                    if (item.type == BankHistoryModel.TYPE_ENUM.RECHARGE) dataExport.totalDeposit += item.amount;
                    if (item.type == BankHistoryModel.TYPE_ENUM.CASHOUT) dataExport.totalWithdraw += item.amount;
                });

                return res.status(200).json({
                    status: true,
                    data: dataExport,
                    msg: "success"
                });
            } else {
                return res.status(200).json({
                    status: false,
                    msg: "User not found"
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
                timeStart = moment().startOf('month');
                timeEnd = moment().endOf('month');
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
            const listUserRef = await AgencyRefModel.findAll({
                where: { agency: agencyData.id },
                attributes: ['id', 'uid', 'createdAt'],
                include: [
                    {
                        model: UserModel,
                        as: "userInfo",
                        attributes: { exclude: ["password", "id", "deletedAt", "code", "status", "role", "updatedAt"] },
                    }
                ],
                raw: true,
                nest: true
            });

            let exportData = listUserRef;
            let arrCursor = 0;
            for (var userRef of listUserRef) {
                let match = {};
                match.uid = userRef.uid;
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
    getBelowTreeArrayByAgency: async (req, res) => {
        try {
            const rootID = req.params.id; // uid agency user
            const getDataRootAgency = await AgencyModel.findOne({
                where: { uid: rootID }
            });

            if (!getDataRootAgency) {
                return res.json({
                    status: false,
                    msg: "Agency Not Found!"
                });
            }

            const getRootAgencyUserInfo = await UserModel.findOne({
                where: {
                    id: getDataRootAgency.id
                }
            });

            const listUserAndAgency = await getUserAndAgencyList(getDataRootAgency.id, true);

            let arrayDataTree = [{
                id: getDataRootAgency.id,
                parentId: 0,
                description: getRootAgencyUserInfo.username,
                userInfo: getRootAgencyUserInfo,
                children: null,
            }];

            for (const dataRef of listUserAndAgency) {
                const userInfo = await UserModel.findOne({
                    where: { id: dataRef }
                });

                let objectDataRef = {};

                if (!!userInfo) {
                    objectDataRef.id = userInfo.id; // gán id riêng biệt từ id user

                    const getRefByAgency = await AgencyRefModel.findOne({
                        where: {
                            uid: userInfo.id
                        }
                    });
                    const getAgencyData = await AgencyModel.findOne({
                        where: {
                            id: getRefByAgency.agency
                        }
                    });
                    const getAgencyUserInfo = await UserModel.findOne({
                        where: {
                            id: getAgencyData.uid
                        }
                    });

                    objectDataRef.parentId = getAgencyUserInfo.id; // user này được ref bởi agecy nào

                    let bonusText = (userInfo.role == UserModel.ROLE_ENUM.AGENCY) ? "Agency" : "Player";

                    objectDataRef.description = `${userInfo.username} (${bonusText})`; // gán text username
                    objectDataRef.tooltip = `Số dư: ${Helper.numberWithCommas(userInfo.coin)}`;
                    objectDataRef.userInfo = userInfo; // gán info user
                    objectDataRef.children = null; // gán children node

                    arrayDataTree.push(objectDataRef);
                }

                //console.log(objectDataRef)
            }

            const treeObject = listToTree(arrayDataTree, {
                idKey: 'id',
                parentKey: 'parentId',
                childrenKey: 'children'
            });

            return res.json(treeObject);

        } catch (e) {
            console.log(e);
            return res.json({
                status: false,
                msg: e.message
            });
        }
    },
    getCurrentTreeArrayByAgency: async (req, res) => {
        try {
            const rootID = req.params.id;

            const getDataRootAgency = await AgencyModel.findOne({
                where: { uid: rootID }
            });

            if (!getDataRootAgency) {
                return res.json({
                    status: false,
                    msg: "Agency Not Found!"
                });
            }

            const getRootAgencyUserInfo = await UserModel.findOne({
                where: {
                    id: getDataRootAgency.id
                }
            });


            const listUserAndAgency = await getCurrentTreeArrayByAgency(getRootAgencyUserInfo.id);

            let arrayDataTree = [];

            for (const dataRef of listUserAndAgency) {
                const userInfo = await UserModel.findOne({
                    where: { id: dataRef.uid }
                });

                let objectDataRef = {};

                if (!!userInfo) {
                    objectDataRef.id = userInfo.id; // gán id riêng biệt từ id user

                    objectDataRef.parentId = dataRef.parentID; // user này được ref bởi agecy nào

                    let bonusText = (dataRef.role == UserModel.ROLE_ENUM.AGENCY) ? "Agency" : "Player";

                    objectDataRef.description = `${dataRef.username} (${bonusText})`; // gán text username
                    objectDataRef.tooltip = `Số dư: ${Helper.numberWithCommas(userInfo.coin)}`;
                    objectDataRef.userInfo = userInfo; // gán info user
                    objectDataRef.children = null; // gán children node

                    arrayDataTree.push(objectDataRef);
                }

                //console.log(objectDataRef)
            }

            const treeObject = listToTree(arrayDataTree, {
                idKey: 'id',
                parentKey: 'parentId',
                childrenKey: 'children'
            });

            return res.json(treeObject);


        } catch (e) {
            console.log(e);
            return res.status(200).json({
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
        },
        changePassword: async (req, res) => {
            try {
                const { id } = req.params;
                const { newPassword } = req.body;

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

                if (newPassword.length <= 5) {
                    return res.status(200).json({
                        status: false,
                        msg: "Mật khẩu ít nhất 5 ký tự!"
                    });
                }

                const user = await findByID(id);

                if (!!user) {
                    user.password = generatePassword(newPassword);
                    await user.save();
                    await user.reload();
                    res.status(200).json({
                        status: true,
                        msg: "Thay đổi mật khẩu thành công!",
                        code: "success"
                    });
                } else {
                    return res.status(200).json({
                        status: false,
                        msg: "Không tìm thấy tài khoản!"
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
