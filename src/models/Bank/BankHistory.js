const { Op } = require("sequelize");
const sequelize = require('@Databases/mysql');
const { Model, DataTypes } = require("sequelize");
const { UserModel } = require("@Models/User/User");

class BankHistoryModel extends Model {
    static TYPE_ENUM = {
        RECHARGE: "recharge",
        CASHOUT: "cashout",
    };
    static STATUS_ENUM = {
        SUCCESS: "success",
        PENDING: "pending",
        PROCESSING: "processing",
        ERROR: "error",
        TIMEOUT: "timeout"
    };
    static scopes = {
        bySearchBankName(bankName) {
            return { where: { bankName: { [Op.like]: `%${bankName}%` } } }
        },
        bySearchBankProvide(bankProvide) {
            return { where: { bankProvide: { [Op.like]: `%${bankProvide}%` } } }
        },
        bySearchBankNumber(bankNumber) {
            return { where: { bankNumber: { [Op.like]: `%${bankNumber}%` } } }
        },
        bySearchTransId(transId) {
            return { where: { transId } }
        },
        bySearchAmount(amount) {
            return { where: { amount } }
        },
        bySearchStatus(status) {
            return { where: { status } }
        },
        bySearchUsername(username) {
            return {
                include: [
                    {
                        model: UserModel,
                        as: "userInfo",
                        where: { username }
                    }
                ]
            }
        },
    }
}

const defineParams = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uid: { type: DataTypes.INTEGER, allowNull: false },
    bankProvide: { type: DataTypes.STRING, allowNull: false },
    bankNumber: { type: DataTypes.STRING, allowNull: false },
    bankName: { type: DataTypes.STRING, allowNull: false },
    transId: { type: DataTypes.STRING, allowNull: true },
    type: {
        type: DataTypes.ENUM({ values: Object.values(BankHistoryModel.TYPE_ENUM) }),
        allowNull: false
    },
    amount: { type: DataTypes.INTEGER, defaultValue: 0 },
    info: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
    status: {
        type: DataTypes.ENUM({ values: Object.values(BankHistoryModel.STATUS_ENUM) }),
        defaultValue: BankHistoryModel.STATUS_ENUM.PENDING,
    },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
    deletedAt: { type: DataTypes.DATE },
}

BankHistoryModel.init(defineParams, {
    paranoid: true,
    tableName: "bank_histories",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    deletedAt: "deletedAt",
    scopes: BankHistoryModel.scopes,
    sequelize,
});

module.exports = {
    BankHistoryModel
};