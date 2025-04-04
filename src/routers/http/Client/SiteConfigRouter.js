const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const SiteConfigController = require("@HttpControllers/Client/SiteConfigController");

router.get("/", (req, res) => {
    res.json({
        status: true
    });
});

router.get("/info", (req, res) => {
    SiteConfigController.infomation(req, res);
});

module.exports = router;

