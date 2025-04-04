const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const MessageController = require("@HttpControllers/Cms/MessageController");

router.get("/", (req, res) => {
  MessageController.listMessage(req, res);
});

router.get("/delete/:id", (req, res) => {
  MessageController.deleteMessage(req, res);
});

router.get("/message-info/:id", (req, res) => {
  MessageController.messageInfo(req, res);
});

router.post("/update/:id", (req, res) => {
  MessageController.Action.update(req, res);
});

router.post("/create", (req, res) => {
  MessageController.Action.create(req, res);
});

module.exports = router;
