const sequelize = require("@Databases/mysql");
// khai báo các models cần khởi tạo khi init server vào đây và gọi chúng ra để khởi tạo model khi init server
const { UserModel } = require("./User/User");
const { BankHistoryModel } = require("./Bank/BankHistory");
const { BankUserModel } = require("./Bank/BankUser");
const { MessageModel } = require("./Message/Message");
const { BetHistoryModel } = require("./Bet/BetHistory");
const { CardHistoryModel } = require("./Card/CardHistory");
const { AgencyModel } = require("./Agency/Agency");
const { AgencyRefModel } = require("./Agency/AgencyRef");
const { VipModel } = require("./Vip/Vip");
const { VipUpgradeModel } = require("./Vip/VipUpgrade");
const { PromotionModel } = require("./Promotion/Promotion");
const { PromotionRegisterModel } = require("./Promotion/PromotionRegister");
const { PasswdSecurityModel } = require("./Security/PasswdSecurity");
const { WithdrawConditionModel } = require("./Withdraw/WithdrawCondition");
const { ConfigModel } = require("./Configs/Configs");

// Call Init Models 
ConfigModel;

// BankHistoryModel chứa nhiều bản ghi có key xác định là field uid
BankHistoryModel.belongsTo(UserModel, {
  as: "userInfo",
  foreignKey: "uid"
});

// UserModel chứa key xác định bản ghi là field id
UserModel.hasMany(BankHistoryModel, {
  as: "bankHistory",
  foreignKey: "id"
});

// CardHistoryModel chứa nhiều bản ghi có key xác định là field uid
CardHistoryModel.belongsTo(UserModel, {
  as: "userInfo",
  foreignKey: "uid"
});

// UserModel chứa key xác định bản ghi là field id
UserModel.hasMany(CardHistoryModel, {
  as: "cardHistory",
  foreignKey: "id"
});

// BankUserModel chứa nhiều bản ghi có key xác định là field uid
BankUserModel.belongsTo(UserModel, {
  as: "userInfo",
  foreignKey: "id"
});

// UserModel chứa key xác định bản ghi là field id
UserModel.hasMany(BankUserModel, {
  as: "BankUser",
  foreignKey: "uid"
});

// MessageModel chứa nhiều bản ghi có key xác định là field uid
MessageModel.belongsTo(UserModel, {
  as: "userInfo",
  foreignKey: "uid"
});

// UserModel chứa key xác định bản ghi là field id
UserModel.hasMany(MessageModel, {
  as: "Message",
  foreignKey: "id"
});

// BetHistoryModel chứa nhiều bản ghi có key xác định là field uid
BetHistoryModel.belongsTo(UserModel, {
  as: "userInfo",
  foreignKey: "uid"
});

// UserModel chứa key xác định bản ghi là field id
UserModel.hasMany(BetHistoryModel, {
  as: "BetHistory",
  foreignKey: "id"
});

// UserModel chứa key xác định bản ghi là field id
AgencyModel.belongsTo(UserModel, {
  as: "userInfo",
  foreignKey: "uid"
});

// AgencyModel chứa nhiều bản ghi có key xác định là field uid
UserModel.hasOne(AgencyModel, {
  as: "AgencyInfo",
  foreignKey: "uid"
});

// UserModel chứa key xác định bản ghi là field id
AgencyRefModel.belongsTo(UserModel, {
  as: "userInfo",
  foreignKey: "uid"
});

// AgencyRefModel chứa nhiều bản ghi có key xác định là field uid
UserModel.hasOne(AgencyRefModel, {
  as: "AgencyRefInfo",
  foreignKey: "id"
});

AgencyRefModel.belongsTo(AgencyModel, {
  as: "AgencyInfo",
  foreignKey: "agency"
});

AgencyModel.hasOne(AgencyRefModel, {
  as: "AgencyReferer",
  foreignKey: "id"
});

// UserModel chứa key xác định bản ghi là field id
UserModel.hasMany(VipModel, {
  as: "VipInfo",
  foreignKey: "uid"
});

// VipModel chứa nhiều bản ghi có key xác định là field uid
VipModel.belongsTo(UserModel, {
  as: "userInfo",
  foreignKey: "uid"
});

// UserModel chứa key xác định bản ghi là field id
UserModel.hasMany(VipUpgradeModel, {
  as: "VipUpgradeInfo",
  foreignKey: "uid"
});

// VipUpgradeModel chứa nhiều bản ghi có key xác định là field uid
VipUpgradeModel.belongsTo(UserModel, {
  as: "userInfo",
  foreignKey: "uid"
});

// UserModel chứa key xác định bản ghi là field id
UserModel.hasMany(PromotionRegisterModel, {
  as: "userRegiserPromotionInfo",
  foreignKey: "uid"
});

// PromotionRegiserModel chứa nhiều bản ghi có key xác định là field uid
PromotionRegisterModel.belongsTo(UserModel, {
  as: "userInfo",
  foreignKey: "uid"
});

// UserModel chứa key xác định bản ghi là field id
PromotionModel.hasMany(PromotionRegisterModel, {
  as: "promotionRegisterInfo",
  foreignKey: "promotion"
});

// PromotionRegiserModel chứa nhiều bản ghi có key xác định là field uid
PromotionRegisterModel.belongsTo(PromotionModel, {
  as: "promotionInfo",
  foreignKey: "uid"
});

// PasswdSecurityModel chứa nhiều bản ghi có key xác định là field uid
PasswdSecurityModel.belongsTo(UserModel, {
  as: "userInfo",
  foreignKey: "uid"
});

// UserModel chứa key xác định bản ghi là field id
UserModel.hasMany(WithdrawConditionModel, {
  as: "WithdrawConditionInfo",
  foreignKey: "uid"
});

// WithdrawConditionModel chứa nhiều bản ghi có key xác định là field uid
WithdrawConditionModel.belongsTo(UserModel, {
  as: "userInfo",
  foreignKey: "uid"
});

// UserModel chứa key xác định bản ghi là field id
UserModel.hasMany(PromotionRegisterModel, {
  as: "PasswordSecurityInfo",
  foreignKey: "uid"
});

const InitializeConnection = sequelize.sync({ alter: true, logging: false });

module.exports = InitializeConnection;