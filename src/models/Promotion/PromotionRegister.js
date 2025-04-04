const sequelize = require("@Databases/mysql");
const { Model, DataTypes } = require("sequelize");

class PromotionRegisterModel extends Model {
}

const defineParams = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uid: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    promotion: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
    deletedAt: { type: DataTypes.DATE }
};

PromotionRegisterModel.init(defineParams, {
    paranoid: true,
    tableName: "promotion_registers",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    deletedAt: "deletedAt",
    sequelize
});

module.exports = {
    PromotionRegisterModel
};