const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const NoticeController = require("@HttpControllers/Client/NoticeController");

router.get("/", (req, res) => {
    NoticeController.listMessage(req, res);
});

router.get("/notice-info/:id", (req, res) => {
    NoticeController.messageInfo(req, res);
});

router.get("/seen/:id", (req, res) => {
    NoticeController.Action.seen(req, res);
});

router.get("/count-new", (req, res) => {
    NoticeController.Action.count(req, res);
});

module.exports = router;
