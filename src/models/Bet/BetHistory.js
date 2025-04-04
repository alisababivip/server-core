const sequelize = require("@Databases/mysql");
const { Model, DataTypes } = require("sequelize");

class BetHistoryModel extends Model {
  static STATUS_ENUM = {
    SUCCESS: "success",
    PENDING: "pending",
    ERROR: "error",
    WIN: "win",
    LOSE: "lose",
    HIT_CANCEL: "hit_cancel",
    PLAYER_CANCEL: "player_cancel",
    DRAW_CANCEL: "draw_cancel",
    SYSTEM_DRAWBACK: "system_drawback",
    TIE: "tie",
    BO_DRAWBACK: "bo_drawback"
  }
}

const defineParams = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  uid: { type: DataTypes.INTEGER, allowNull: false },
  username: { type: DataTypes.STRING, allowNull: true },
  betAmount: { type: DataTypes.INTEGER, allowNull: true },
  validBetAmount: { type: DataTypes.INTEGER, allowNull: true },
  winAmount: { type: DataTypes.INTEGER, allowNull: true },
  netPnl: { type: DataTypes.INTEGER, allowNull: true },
  currency: { type: DataTypes.STRING, allowNull: true },
  transactionTime: { type: DataTypes.STRING, allowNull: true },
  gameCode: { type: DataTypes.STRING, allowNull: true },
  gameName: { type: DataTypes.STRING, allowNull: true },
  betOrderNo: { type: DataTypes.STRING, allowNull: true },
  betTime: { type: DataTypes.STRING, allowNull: true },
  productType: { type: DataTypes.INTEGER, allowNull: true },
  gameCategory: { type: DataTypes.STRING, allowNull: true },
  sessionId: { type: DataTypes.STRING, allowNull: true },
  status: {
    type: DataTypes.ENUM({ values: Object.values(BetHistoryModel.STATUS_ENUM) }),
    allowNull: false,
    defaultValue: BetHistoryModel.STATUS_ENUM.SUCCESS
  },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
  deletedAt: { type: DataTypes.DATE },
};

BetHistoryModel.init(defineParams, {
  paranoid: true,
  indexes: [{ unique: true, fields: ["betOrderNo"] }],
  tableName: "bet_histories",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  deletedAt: "deletedAt",
  sequelize
});

module.exports = {
  BetHistoryModel
};
