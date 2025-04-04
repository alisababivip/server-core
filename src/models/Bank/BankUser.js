const sequelize = require('@Databases/mysql');
const { Model, DataTypes } = require("sequelize");

class BankUserModel extends Model {
    static STATUS_ENUM = {
        ACTIVE: "active",
        INACTIVE: "inactive",
        PENDING: "pending",
    };
}

const defineParams = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uid: { type: DataTypes.INTEGER, allowNull: false },
    bankProvide: { type: DataTypes.STRING, allowNull: false },
    bankNumber: { type: DataTypes.STRING, allowNull: false },
    bankName: { type: DataTypes.STRING, allowNull: false },
    bankBranch: { type: DataTypes.STRING, allowNull: false },
    status: {
        type: DataTypes.ENUM({ values: Object.values(BankUserModel.STATUS_ENUM) }),
        defaultValue: BankUserModel.STATUS_ENUM.ACTIVE,
    },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
    deletedAt: { type: DataTypes.DATE },
}

BankUserModel.init(defineParams, {
    paranoid: true,
    tableName: "bank_user",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    deletedAt: "deletedAt",
    sequelize,
});

module.exports = {
    BankUserModel
};