const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const middware = require("@Middwares/http/AgentAuthenticate");
const AuthRouter = require("./AuthRouter");
const UserRouter = require("./UserRouter");
const AgencyRouter = require("./AgencyRouter");
const DepositRouter = require("./DepositRouter");
const DepositCardRouter = require("./DepositCardRouter");
const WithdrawRouter = require("./WithdrawRouter");
const GameRouter = require("./GameRouter");
const PromotionRouter = require("./PromotionRouter");

router.use("/auth", AuthRouter);
router.use("/user", middware, UserRouter);
router.use("/agency", middware, AgencyRouter);
router.use("/deposit", middware, DepositRouter);
//router.use("/depositCard", middware, DepositCardRouter);
router.use("/withdraw", middware, WithdrawRouter);
router.use("/game", middware, GameRouter);
router.use("/promotion", middware, PromotionRouter);

module.exports = router;
