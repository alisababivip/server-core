const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const PromotionController = require("@HttpControllers/Agent/PromotionController");

router.get("/", (req, res) => {
    PromotionController.listPromotion(req, res);
});

router.get("/delete/:id", (req, res) => {
    PromotionController.deletePromotion(req, res);
});

router.get("/promotion-info/:id", (req, res) => {
    PromotionController.promotionInfo(req, res);
});

router.get("/promotion-registered/:id", (req, res) => {
    PromotionController.promotionRegisted(req, res);
});

router.post("/update/:id", (req, res) => {
    PromotionController.Action.update(req, res);
});

router.post("/create", (req, res) => {
    PromotionController.Action.create(req, res);
});

module.exports = router;
