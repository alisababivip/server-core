const sequelize = require("@Databases/mysql");
const { Model, DataTypes } = require("sequelize");

class MessageModel extends Model {
  static TYPE_ENUM = {
    ALL: "all",
    USER: "user"
  };
}

const defineParams = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: {
    type: DataTypes.ENUM({ values: Object.values(MessageModel.TYPE_ENUM) }),
    allowNull: false
  },
  uid: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  title: { type: DataTypes.STRING, allowNull: true, defaultValue: "" },
  content: { type: DataTypes.TEXT, allowNull: true, defaultValue: "" },
  seen: { type: DataTypes.BOOLEAN, defaultValue: false },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
  deletedAt: { type: DataTypes.DATE }
};

MessageModel.init(defineParams, {
  paranoid: true,
  tableName: "messages",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  deletedAt: "deletedAt",
  sequelize
});

module.exports = {
  MessageModel
};
