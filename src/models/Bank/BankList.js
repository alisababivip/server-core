const sequelize = require('@Databases/mysql');
const { Model, DataTypes } = require("sequelize");

class BankListModel extends Model {
    static STATUS_ENUM = {
        ACTIVE: "active",
        INACTIVE: "inactive",
        PENDING: "pending",
    };
}

const defineParams = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    bankProvide: { type: DataTypes.STRING, allowNull: false },
    bankNumber: { type: DataTypes.STRING, allowNull: false },
    bankName: { type: DataTypes.STRING, allowNull: false },
    status: {
        type: DataTypes.ENUM({ values: Object.values(BankListModel.STATUS_ENUM) }),
        defaultValue: BankListModel.STATUS_ENUM.ACTIVE,
    },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
    deletedAt: { type: DataTypes.DATE },
}

BankListModel.init(defineParams, {
    paranoid: true,
    tableName: "bank_list",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    deletedAt: "deletedAt",
    sequelize,
});

module.exports = {
    BankListModel
};