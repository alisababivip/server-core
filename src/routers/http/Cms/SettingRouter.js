const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const SettingController = require("@HttpControllers/Cms/SettingController");

router.get("/", (req, res) => {
    SettingController.index(req, res);
});

router.get("/general", (req, res) => {
    SettingController.General(req, res);
});

router.post("/general", (req, res) => {
    SettingController.Action.updateGeneral(req, res);
});

router.get("/telegram", (req, res) => {
    SettingController.Telegram(req, res);
});

router.post("/telegram", (req, res) => {
    SettingController.Action.updateTelegram(req, res);
});

module.exports = router;
