const router = require("express").Router();
const middware = require("@Middwares/http/Authenticate");
const middwareAgency = require("@Middwares/http/AgentAuthenticate");
const CaptchaController = require("@HttpControllers/CaptchaController");

// captcha
router.get("/captcha", (req, res) => CaptchaController(req, res));

// Client Router
const SiteConfigRouter = require("@HttpRouters/Client/SiteConfigRouter");
const AuthRouter = require("@HttpRouters/Client/AuthRouter");
const PaymentRouter = require("@HttpRouters/Client/PaymentRouter");
const ProductRouter = require("@HttpRouters/Client/ProductRouter");
const GameRouter = require("@HttpRouters/Client/GameRouter");
const MessageRouter = require("@HttpRouters/Client/MessageRouter");
const AnnoucementRouter = require("@HttpRouters/Client/AnnoucementRouter");
const NoticeRouter = require("@HttpRouters/Client/NoticeRouter");
const VipRouter = require("@HttpRouters/Client/VipRouter");
const PromotionRouter = require("@HttpRouters/Client/PromotionRouter");
const AgencyRouter = require("@HttpRouters/Client/AgencyRouter");
router.use("/config", SiteConfigRouter);
router.use("/auth", AuthRouter);
router.use("/product", ProductRouter);
router.use("/payment", middware, PaymentRouter);
router.use("/game", middware, GameRouter);
router.use("/message", middware, MessageRouter);
router.use("/annoucement", middware, AnnoucementRouter);
router.use("/notice", middware, NoticeRouter);
router.use("/vip", middware, VipRouter);
router.use("/promotion", PromotionRouter);
router.use("/agency", middware, middwareAgency, AgencyRouter);

// CMS MANAGER Router
const CmsRouter = require("@HttpRouters/Cms");
router.use("/cms", CmsRouter);

// AGENT MANAGER Router
const AgentRouter = require("@HttpRouters/Agent");
router.use("/agent", AgentRouter);

module.exports = router;
