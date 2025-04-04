const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const middware = require("@Middwares/http/CmsAuthenticate");
const AuthRouter = require("./AuthRouter");
const BankDepositRouter = require("./BankDepositRouter");
const UserRouter = require("./UserRouter");
const AgencyRouter = require("./AgencyRouter");
const DepositRouter = require("./DepositRouter");
const DepositCardRouter = require("./DepositCardRouter");
const WithdrawRouter = require("./WithdrawRouter");
const MessageRouter = require("./MessageRouter");
const AnnouncementRouter = require("./AnnouncementRouter");
const GameRouter = require("./GameRouter");
const DashboardRouter = require("./DashboardRouter");
const SettingRouter = require("./SettingRouter");
const PromotionRouter = require("./PromotionRouter");
const BankRouter = require("./BankRouter");


router.use("/auth", AuthRouter);
router.use("/user", middware, UserRouter);
router.use("/agency", middware, AgencyRouter);
router.use("/bankDeposit", middware, BankDepositRouter);
router.use("/deposit", middware, DepositRouter);
router.use("/depositCard", middware, DepositCardRouter);
router.use("/withdraw", middware, WithdrawRouter);
router.use("/message", middware, MessageRouter);
router.use("/announcement", middware, AnnouncementRouter);
router.use("/game", middware, GameRouter);
router.use("/dashboard", middware, DashboardRouter);
router.use("/setting", middware, SettingRouter);
router.use("/promotion", middware, PromotionRouter);
router.use("/bank", middware, BankRouter);

module.exports = router;
