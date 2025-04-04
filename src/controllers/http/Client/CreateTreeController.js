const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const { Op } = require("sequelize");
const {
    ERROR_PAGE,
    ERROR_FORM,
    ERROR_AUTH,
    ERROR_AUTH_MESSAGE,
    ERROR_MESSAGES
} = require("@Helpers/contants");
const { parseInt } = require("@Helpers/Number");
const {
    findByID,
    findByUsername,
    UserModel } = require("@Models/User/User");
const { BetHistoryModel } = require("@Models/Bet/BetHistory");
const { BankHistoryModel } = require("@Models/Bank/BankHistory");
const {
    findByRefCode,
    AgencyModel
} = require("@Models/Agency/Agency");
const { AgencyRefModel } = require("@Models/Agency/AgencyRef");

const { getCurrentAgencyList, getCurrentUserList, getUserAndAgencyList } = require("@Models/Agency/AgencyHelper");

module.exports = {
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
                    objectDataRef.description = userInfo.username; // gán text username
                    objectDataRef.userInfo = userInfo; // gán info user
                    objectDataRef.children = null; // gán children node

                    arrayDataTree.push(objectDataRef);
                }

                //console.log(objectDataRef)
            }

            return res.json(arrayDataTree);

        } catch (e) {
            console.log(e);
            return res.json({
                status: false,
                msg: e.message
            });
        }
    }
};