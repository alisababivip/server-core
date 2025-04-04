const sequelize = require("@Databases/mysql");
const { Model, DataTypes } = require("sequelize");

class PromotionModel extends Model {
    static STATUS_ENUM = {
        TRUE: true,
        FALSE: false
    }
    static IS_REGISTER_ENUM = {
        YES: true,
        NO: false
    }
}

const defineParams = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: true, defaultValue: "" },
    thumbnail: { type: DataTypes.STRING, allowNull: true, defaultValue: "" },
    content: { type: DataTypes.TEXT, allowNull: true, defaultValue: "" },
    isRegister: { type: DataTypes.BOOLEAN, defaultValue: true },
    status: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
    deletedAt: { type: DataTypes.DATE }
};

PromotionModel.init(defineParams, {
    paranoid: true,
    tableName: "promotions",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    deletedAt: "deletedAt",
    sequelize
});

module.exports = {
    PromotionModel
};
