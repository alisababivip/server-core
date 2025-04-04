const sequelize = require("@Databases/mysql");
const { Model, DataTypes } = require("sequelize");

class VipUpgradeModel extends Model { }

const defineParams = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uid: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    from: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    to: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    coin_reward: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    coin_monthly: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    percent_relief: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
    deletedAt: { type: DataTypes.DATE }
};

VipUpgradeModel.init(defineParams, {
    paranoid: true,
    tableName: "vip_upgrade",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    deletedAt: "deletedAt",
    sequelize
});

module.exports = {
    VipUpgradeModel
};
