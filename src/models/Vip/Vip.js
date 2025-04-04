const sequelize = require("@Databases/mysql");
const { Model, DataTypes } = require("sequelize");

class VipModel extends Model { }

const defineParams = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uid: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    vip_current: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
    deletedAt: { type: DataTypes.DATE }
};

VipModel.init(defineParams, {
    paranoid: true,
    indexes: [{ unique: true, fields: ["uid"] }],
    tableName: "vips",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    deletedAt: "deletedAt",
    sequelize
});

module.exports = {
    VipModel
};
