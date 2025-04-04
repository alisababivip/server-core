const { UserModel } = require("@Models/User/User");
const { AgencyModel } = require("@Models/Agency/Agency");
const { AgencyRefModel } = require("@Models/Agency/AgencyRef");

// This function will retrieve a list of downlines starting from F0 and return an object containing downline information.
const getTheAgencyLevel = async (masterAgentId) => {
    let arrEx = {};
    try {
        for (var i = 1; i <= 1000; i++) {
            if (i == 1) {
                const getDownlines = await AgencyRefModel.findAll({
                    where: { agency: masterAgentId },
                    include: [
                        {
                            model: UserModel.scope('withRoleAgency', 'withAgencyInfo'),
                            as: "userInfo",
                            attributes: { exclude: ["password", "deletedAt", "code", "status", "updatedAt"] },
                            require: false
                        }
                    ],
                    attributes: { exclude: ["deletedAt", "updatedAt"] },
                    raw: true,
                    nest: true
                });

                if (getDownlines.length > 0) {
                    arrEx["cap" + i] = getDownlines;
                } else {
                    break;
                }
            } else {
                if (arrEx.hasOwnProperty(["cap" + (i - 1)]) && arrEx["cap" + (i - 1)].length > 0) {
                    arrEx["cap" + i] = [];
                    for (const agent of arrEx["cap" + (i - 1)]) {
                        if (!!agent) {
                            const downlinesAgent = await AgencyRefModel.findOne({
                                where: { agency: agent.userInfo.AgencyInfo.id },
                                include: [
                                    {
                                        model: UserModel.scope('withRoleAgency', 'withAgencyInfo'),
                                        as: "userInfo",
                                        attributes: { exclude: ["password", "deletedAt", "code", "status", "updatedAt"] },
                                        require: false
                                    }
                                ],
                                attributes: { exclude: ["deletedAt", "updatedAt"] },
                                raw: true,
                                nest: true
                            });
                            if (!!downlinesAgent) arrEx["cap" + i].push(downlinesAgent);
                        }
                    }
                    if (arrEx["cap" + i].length <= 0) delete arrEx["cap" + i];
                } else {
                    break;
                }
            }
        }

        return arrEx;

    } catch (e) {
        console.log(e);
        return arrEx;
    }
}

const getLevelOfAgency = async (currentAgentId) => {
    // currentAgentId = uid user
    let DEFAULT_LEVEL = 1;
    let UpLineAgencyArr = [];
    let UpLineAgencyText = "";

    const getRefByOtherAgency = await AgencyRefModel.findOne({ where: { uid: currentAgentId } });

    if (!getRefByOtherAgency) {
        const getInfoAgency = await AgencyModel.findOne({ where: { uid: currentAgentId } });
        const agencyUserInfo = await UserModel.findOne({ where: { id: getInfoAgency.uid } });

        UpLineAgencyArr.push({ uid: agencyUserInfo.id, username: agencyUserInfo.username });
        return {
            level: DEFAULT_LEVEL,
            upLineAgencyArr: UpLineAgencyArr,
            upLineAgencyText: UpLineAgencyText += agencyUserInfo.username + "↗"
        };
    }

    const getInfoAgency = await AgencyModel.findOne({ where: { id: currentAgentId } });
    const agencyUserInfo = await UserModel.findOne({ where: { id: getInfoAgency.uid } });

    UpLineAgencyArr.push({ uid: agencyUserInfo.id, username: agencyUserInfo.username });
    UpLineAgencyText += agencyUserInfo.username + "↗";

    let cursorAgencyId = getRefByOtherAgency.agency;
    // loop infinity when not have other ref 
    for (; ;) {
        const getInfoAgency = await AgencyModel.findOne({ where: { id: cursorAgencyId } });
        const agencyUserInfo = await UserModel.findOne({ where: { id: getInfoAgency.uid } });
        if (!!getInfoAgency) {
            const getRefByOtherAgency = await AgencyRefModel.findOne({ where: { uid: getInfoAgency.uid } });
            if (!getRefByOtherAgency) {
                DEFAULT_LEVEL++;
                UpLineAgencyArr.push({ uid: agencyUserInfo.id, username: agencyUserInfo.username });
                return {
                    level: DEFAULT_LEVEL,
                    upLineAgencyArr: UpLineAgencyArr,
                    upLineAgencyText: UpLineAgencyText += agencyUserInfo.username + "↗"
                };
            }

            if (!!getRefByOtherAgency) {
                cursorAgencyId = getRefByOtherAgency.agency;
                DEFAULT_LEVEL++;
                continue;
            }
        } else {
            UpLineAgencyArr.push({ uid: agencyUserInfo.id, username: agencyUserInfo.username });
            return {
                level: DEFAULT_LEVEL,
                upLineAgencyArr: UpLineAgencyArr,
                upLineAgencyText: UpLineAgencyText += agencyUserInfo.username + "↗"
            };
        }
    }
}

const getCurrentAgencyList = async (masterAgentId, exportType = true) => {
    let arrUserUid = [];
    let arrAgencyId = [];
    const getDownlinesAgency = await getTheAgencyLevel(masterAgentId);
    for (const [level, dataAgency] of Object.entries(getDownlinesAgency)) {
        //console.log(level, dataAgency);
        dataAgency.forEach(agency => {
            arrUserUid.push(agency.userInfo.id);
            arrAgencyId.push(agency.userInfo.AgencyInfo.id);
        });
    }

    const refUserByAgency = await AgencyRefModel.findAll({ where: { agency: arrAgencyId }, attributes: ["uid"] });
    refUserByAgency.forEach((ref) => arrUserUid.push(ref.uid));

    arrUserUid = [...new Set(arrUserUid)];

    return arrUserUid;
}

const getCurrentUserList = async (masterAgentId, exportType = true) => {
    let match = {};
    let assocScopes = [];
    // add condition agency = curent agency id
    match.agency = masterAgentId;

    assocScopes.push(
        { method: ['withUserInfo'] },
        { method: ['withRoleUser'] },
        //{ method: ['withRoleUser'] }
    );

    let getUsers = await AgencyRefModel.scope(assocScopes).findAll({
        where: match,
        order: [["id", "ASC"]],
        attributes: { exclude: ["password", "deletedAt"] },
    });

    let expListUser = [];
    for (const user of getUsers) {
        (exportType) ? expListUser.push(user.userInfo) : expListUser.push(user.userInfo.id);
    }
    return expListUser;
}

const getUserAndAgencyList = async (masterAgentId, exportType = false) => {
    const arrUserAndAgency = [];
    const arrUserUid = await getCurrentAgencyList(masterAgentId, exportType);
    const arrAgencyId = await getCurrentUserList(masterAgentId, exportType);

    return [...new Set(arrUserAndAgency.concat(arrUserUid, arrAgencyId))];
}

const getBelowTreeArrayByAgency = async (masterAgentId) => {
    // masterAgentId = uid agency user
    const getDataRootAgency = await AgencyModel.findOne({
        where: { uid: masterAgentId }
    });

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
                },
                attributes: { exclude: ["password", "id", "deletedAt", "code", "updatedAt"] },
            });
            const getAgencyData = await AgencyModel.findOne({
                where: {
                    id: getRefByAgency.agency
                }
            });
            const getAgencyUserInfo = await UserModel.findOne({
                where: {
                    id: getAgencyData.uid
                },
                attributes: ["id"]
            });

            objectDataRef.parentId = getAgencyUserInfo.id; // user này được ref bởi agecy nào
            objectDataRef.description = userInfo.username; // gán text username
            objectDataRef.tooltip = userInfo.username; // gán hover tooltip username
            objectDataRef.userInfo = userInfo; // gán info user
            objectDataRef.children = null; // gán children node

            arrayDataTree.push(objectDataRef);
        }

        //console.log(objectDataRef)
    }

    return arrayDataTree;
}

const getUplineAgency = async (currentAgentId) => {
    // currentAgentId = uid user
    let UpLineAgencyArr = [];

    const getRefByOtherAgency = await AgencyRefModel.findOne({ where: { uid: currentAgentId } });
    if (!getRefByOtherAgency) {
        const getInfoAgency = await AgencyModel.findOne({ where: { id: currentAgentId } });
        const agencyUserInfo = await UserModel.findOne({ where: { id: getInfoAgency.uid } });
        UpLineAgencyArr.push({ uid: agencyUserInfo.id, username: agencyUserInfo.username, role: agencyUserInfo.role, parentID: 0 });
        return UpLineAgencyArr;
    }

    const getInfoAgency = await AgencyModel.findOne({ where: { id: currentAgentId } });
    const agencyUserInfo = await UserModel.findOne({ where: { id: getInfoAgency.uid } });

    UpLineAgencyArr.push({ uid: agencyUserInfo.id, username: agencyUserInfo.username, role: agencyUserInfo.role, parentID: getInfoAgency.uid });

    let cursorAgencyId = getRefByOtherAgency.agency;
    // loop infinity when not have other ref 
    for (; ;) {
        const getInfoAgency = await AgencyModel.findOne({ where: { id: cursorAgencyId } });
        const agencyUserInfo = await UserModel.findOne({ where: { id: getInfoAgency.uid } });
        if (!!getInfoAgency) {
            const getRefByOtherAgency = await AgencyRefModel.findOne({ where: { uid: getInfoAgency.uid } });
            if (!getRefByOtherAgency) {
                UpLineAgencyArr.push({ uid: agencyUserInfo.id, username: agencyUserInfo.username, role: agencyUserInfo.role, parentID: 0 });
                return UpLineAgencyArr;
            }

            if (!!getRefByOtherAgency) {
                cursorAgencyId = getRefByOtherAgency.agency;
                UpLineAgencyArr.push({ uid: agencyUserInfo.id, username: agencyUserInfo.username, role: agencyUserInfo.role, parentID: getInfoAgency.uid });
                continue;
            }
        } else {
            UpLineAgencyArr.push({ uid: agencyUserInfo.id, username: agencyUserInfo.username, role: agencyUserInfo.role, parentID: 0 });
            return UpLineAgencyArr;
        }
    }
}

const getDownlineUserAndAgency = async (currentAgentId) => {
    // currentAgentId = uid user
    let DownLineAgencyArr = [];

    const downlineID = await getUserAndAgencyList(currentAgentId, false);
    for (const id of downlineID) {
        const userData = await UserModel.findOne({ where: { id }, attributes: ["id", "username", "role"] });
        const getRefByOrtherAgency = await AgencyRefModel.findOne({ where: { uid: userData.id } });
        const getInfoAgency = await AgencyModel.findOne({ where: { id: getRefByOrtherAgency.agency } });
        DownLineAgencyArr.push({
            uid: userData.id,
            username: userData.username,
            role: userData.role,
            parentID: getInfoAgency.uid
        });
    }
    return DownLineAgencyArr;
}

const getCurrentTreeArrayByAgency = async (masterAgentId) => {
    const donwline = await getDownlineUserAndAgency(masterAgentId);
    const upline = await getUplineAgency(masterAgentId);
    // Downline Agency
    return [].concat(upline, donwline);
}

module.exports = {
    getTheAgencyLevel,
    getLevelOfAgency,
    getCurrentAgencyList,
    getCurrentUserList,
    getUserAndAgencyList,
    getBelowTreeArrayByAgency,
    getCurrentTreeArrayByAgency
};
