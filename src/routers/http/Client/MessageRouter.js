const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const MessageController = require("@HttpControllers/Client/MessageController");

router.get("/", (req, res) => {
  MessageController.listMessage(req, res);
});

router.get("/message-info/:id", (req, res) => {
  MessageController.messageInfo(req, res);
});

router.get("/seen/:id", (req, res) => {
  MessageController.Action.seen(req, res);
});

router.get("/count-new", (req, res) => {
  MessageController.Action.count(req, res);
});

module.exports = router;
