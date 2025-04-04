const { UserModel } = require("@Models/User/User");
const { WithdrawConditionModel } = require("@Models/Withdraw/WithdrawCondition");
const userWithdrawCondion = require("@Configs/condition/userWithdraw.json");

module.exports = async () => {
    const getAllUser = await UserModel.findAll();

    let bulkCreateData = [];
    let i = 1;
    for (const user of getAllUser) {
        bulkCreateData.push({
            "uid": user.id,
            "minimumNumbOfBet": userWithdrawCondion.minimumNumbOfBet,
            "totalMinimumBetAmount": userWithdrawCondion.totalMinimumBetAmount,
        });
        //if (i == 30) break;
        i++;
    };

    //console.log(bulkCreateData);

    const create = await WithdrawConditionModel.bulkCreate(bulkCreateData, { ignoreDuplicates: true });
    if (!!create) { console.log("SUCCESS CREATE USER WITHDRAW CONDITION!!!"); } else { console.log("ERROR CREATE USER WITHDRAW CONDITION!!!"); }
}