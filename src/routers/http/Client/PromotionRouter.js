const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const middware = require('@Middwares/http/Authenticate');
const PromotionController = require("@HttpControllers/Client/PromotionController");

router.get("/", (req, res) => {
    PromotionController.default(req, res);
});

router.get("/promotion-info/:id", (req, res) => {
    PromotionController.promotionInfo(req, res);
});

router.get("/promotion-check-register/:id", middware, (req, res) => {
    PromotionController.promotionCheckRegister(req, res);
});

router.post("/promotion-register/:id", middware, (req, res) => {
    PromotionController.promotionRegister(req, res);
});

module.exports = router;