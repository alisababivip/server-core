const sequelize = require("@Databases/mysql");
const { Model, DataTypes } = require("sequelize");

class WithdrawConditionModel extends Model { }

const defineParams = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uid: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    minimumNumbOfBet: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Minimum number of bets'
    },
    totalMinimumBetAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total Minimum Bet Amount'
    },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
    deletedAt: { type: DataTypes.DATE }
};

WithdrawConditionModel.init(defineParams, {
    paranoid: true,
    indexes: [{ unique: true, fields: ["uid"] }],
    tableName: "withdraw_conditions",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    deletedAt: "deletedAt",
    sequelize
});

WithdrawConditionModel.findByUserId = async (uid) => {
    return await WithdrawConditionModel.findOne({ where: { uid } });
}

module.exports = {
    WithdrawConditionModel
};
