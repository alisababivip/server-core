const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Ho_Chi_Minh");

const Daily = require('@Models/DailyUser');
const Referer = require('@Models/Referer');
const RefUser = require('@Models/RefUsers');
const UserInfo = require('@Models/UserInfo');
const TotalSpend = require('@Models/TotalSpend');
const BankHistory = require('@Models/Bank/Bank_history');
const NapThe = require('@Models/NapThe');
const UserHistory = require('@Models/UserHistory');

const UserHistoryEnums = {};

const getProfitByAgentMaster = async (data, client, socketMain) => {
    try {
        if (!!data && !!data.code) {

            let sort = -1;
            let timeStart, timeEnd;

            if (!!data.from && !!data.to) {
                timeStart = moment(data.from, "DD/MM/YYYY").startOf('day');
                timeEnd = moment(data.to, "DD/MM/YYYY").endOf('day');
            } else {
                timeStart = moment().startOf('day');
                timeEnd = moment().endOf('day');
            }


            let arrUserId = [];
            const findIDs = await RefUser.find({ code: data.code }, 'uid').exec();
            findIDs.forEach((data) => {
                arrUserId.push(data.uid);
            });

            if (!!data.getTotalUsers) {
                client.red({
                    getProfitByAgentMaster: {
                        status: true,
                        count_user: arrUserId.length,
                        msg: "Success"
                    }
                });          
                return;      
            }

            if (arrUserId.length > 0) {

                const getUserLists = await UserInfo.find(
                    { "id": { "$in": arrUserId } },
                    '_id id name UID red redPlay redWin redLost vip lastVip veryphone',
                    { sort: { "_id": sort } }
                ).exec();

                let arrDataUsers = [];

                for (const user of getUserLists) {
                    const findTotalSpend = await TotalSpend.findOne({ 'uid': user.id }, 'red').exec();

                    let userCache = Object.assign({}, user._doc, { totalSpend: findTotalSpend.red });
                    userCache.red = Number(userCache.red);
                    userCache.redLost = Number(userCache.redLost);
                    userCache.redPlay = Number(userCache.redPlay);
                    userCache.redWin = Number(userCache.redWin);
                    userCache.vip = Number(userCache.vip);
                    userCache.lastVip = Number(userCache.lastVip);

                    // Điểm vip Hiện Tại
                    const vipCurrent = ((userCache.redPlay - userCache.lastVip) / 100000) >> 0;
                    let vip = 0; // level
                    if (vipCurrent >= 1500000000) {  // vip 9
                        vip = 9;
                    } else if (vipCurrent >= 988000000) { // vip 8
                        vip = 8;
                    } else if (vipCurrent >= 600000000) { // vip 7
                        vip = 7;
                    } else if (vipCurrent >= 300000000) { // vip 6
                        vip = 6;
                    } else if (vipCurrent >= 150000000) { // vip 5
                        vip = 5;
                    } else if (vipCurrent >= 50000000) { // vip 4
                        vip = 4;
                    } else if (vipCurrent >= 10000000) { // vip 3
                        vip = 3;
                    } else if (vipCurrent >= 2000000) {  // vip 2
                        vip = 2;
                    } else {
                        vip = 1;
                    }
                    userCache.vipLevel = vip;

                    let findHistoryBank = await BankHistory.find({
                        time: {
                            $gte: timeStart.toDate(),
                            $lte: moment(timeEnd).toDate()
                        },
                        type: 0,
                        status: 1,
                        uid: user.id
                    }, 'money').exec()

                    let findHistoryThecao = await NapThe.find({
                        time: {
                            $gte: timeStart.toDate(),
                            $lte: moment(timeEnd).toDate()
                        },
                        status: 1,
                        uid: user.id
                    }, 'nhan').exec();

                    let findHistoryRut = await BankHistory.find({
                        time: {
                            $gte: timeStart.toDate(),
                            $lte: moment(timeEnd).toDate()
                        },
                        type: 1,
                        status: 1,
                        uid: user.id
                    }, 'money').exec();

                    let totalNapBank = 0; for (const rows of findHistoryBank) totalNapBank += Number(rows.money);
                    let totalNapThe = 0; for (const rows of findHistoryThecao) totalNapThe += Number(rows.nhan);
                    let totalRut = 0; for (const rows of findHistoryRut) totalRut += Number(rows.money);
                    let totalNap = totalNapBank + totalNapThe;

                    userCache = Object.assign({}, userCache, { totalNapBank });
                    userCache = Object.assign({}, userCache, { totalNapThe });
                    userCache = Object.assign({}, userCache, { totalNap });
                    userCache = Object.assign({}, userCache, { totalRut });

                    let arrTransTypeReward = [
                        UserHistoryEnums.GIFTCODE,
                        UserHistoryEnums.NHAN_TIEN_VIP,
                        UserHistoryEnums.NHAN_TIEN_NHIEM_VU,
                        UserHistoryEnums.EVENT_RECIVE,
                    ];
                    let getBonusReward = await UserHistory.find(
                        {
                            "uid": user.id,
                            "transType": {
                                "$in": arrTransTypeReward
                            },
                            time: {
                                $gte: timeStart.toDate(),
                                $lte: moment(timeEnd).toDate()
                            },
                        }
                        , 'red').exec();
                    let bonusReward = 0; for (const rows of getBonusReward) bonusReward += Number(rows.red);
                    userCache = Object.assign({}, userCache, { bonusReward });
                    arrDataUsers.push(userCache);

                    client.red({
                        getProfitByAgentMaster: {
                            status: true,
                            user_profit: userCache,
                            msg: "Success"
                        }
                    });

                };

                client.red({
                    getProfitByAgentMaster: {
                        status: true,
                        data: {
                            users: arrDataUsers,
                            total: arrDataUsers.length
                        },
                        msg: "Success"
                    }
                });

            } else {
                client.red({
                    getProfitByAgentMaster: {
                        status: true,
                        data: {
                            users: [],
                            total: 0
                        },
                        msg: "Success"
                    }
                });
            }
        } else {
            // missing code
            client.red({
                getProfitByAgentMaster: {
                    status: false,
                    msg: "Missing Referer Code"
                }
            });
        }
    } catch (e) {
        client.red({
            getProfitByAgentMaster: {
                status: false,
                msg: e.message
            }
        });
    }
}


module.exports = {
    onData: (data, socket, socketMain) => {
        if (!!data.getProfitByAgentMaster) {
            getProfitByAgentMaster(data.getProfitByAgentMaster, socket, socketMain);
        }
    }
}
