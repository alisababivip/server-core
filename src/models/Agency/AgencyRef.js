const sequelize = require("@Databases/mysql");
const { Op } = require("sequelize");
const { Model, DataTypes } = require("sequelize");
const { UserModel } = require("@Models/User/User");
const { AgencyModel } = require("@Models/Agency/Agency");
const { BankUserModel } = require("@Models/Bank/BankUser");


class AgencyRefModel extends Model {
    static scopes = {
        withUserInfo() {
            return {
                include: [
                    {
                        model: UserModel,
                        as: "userInfo",
                        attributes: { exclude: ["password", "deletedAt", "code", "role", "updatedAt"] },
                        include: [
                            {
                                model: BankUserModel,
                                as: "BankUser"
                            }
                        ]
                    }
                ]
            }
        },
        withRoleUser() {
            return {
                include: [
                    {
                        model: UserModel,
                        as: "userInfo",
                        where: { role: UserModel.ROLE_ENUM.USER }
                    }
                ]
            }
        },
        withRoleAgency() {
            return {
                include: [
                    {
                        model: UserModel,
                        as: "userInfo",
                        where: { role: UserModel.ROLE_ENUM.AGENCY }
                    }
                ]
            }
        },
        withAgencyInfo() {
            return {
                include: [
                    {
                        model: AgencyModel,
                        as: "AgencyInfo"
                    }
                ]
            }
        },
        byAgencyCode(code) {
            return {
                include: [
                    {
                        model: UserModel,
                        as: "userInfo",
                    },
                    {
                        model: AgencyModel,
                        as: "AgencyInfo",
                        where: { code: code }
                    }
                ]
            }
        },
        bySearchName(name) {
            return {
                include: [
                    {
                        model: UserModel,
                        as: "userInfo",
                        where: { name: { [Op.like]: `%${name}%` } }
                    }
                ]
            }
        },
        bySearchUsername(username) {
            return {
                include: [
                    {
                        model: UserModel,
                        as: "userInfo",
                        where: { username: { [Op.like]: `%${username}%` } }
                    }
                ]
            }
        },
        bySearchPhone(phone) {
            return {
                include: [
                    {
                        model: UserModel,
                        as: "userInfo",
                        where: { phone: { [Op.like]: `%${phone}%` } }
                    }
                ]
            }
        },
        bySearchEmail(email) {
            return {
                include: [
                    {
                        model: UserModel,
                        as: "userInfo",
                        where: { email: { [Op.like]: `%${email}%` } }
                    }
                ]
            }
        },
    }
}

const defineParams = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uid: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    agency: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
    deletedAt: { type: DataTypes.DATE }
};

AgencyRefModel.init(defineParams, {
    paranoid: true,
    indexes: [{ unique: true, fields: ["uid"] }],
    tableName: "agency_referer",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    deletedAt: "deletedAt",
    scopes: AgencyRefModel.scopes,
    sequelize
});

module.exports = {
    AgencyRefModel
};
