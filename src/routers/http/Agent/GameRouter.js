const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
// const middware = require('@Middwares/http/Authenticate');
const GameController = require("@HttpControllers/Agent/GameController");

router.get("/bet-history", (req, res) => {
  GameController.betHistory(req, res);
});
router.get("/bet-history/:id", (req, res) => {
  GameController.betHistoryByUser(req, res);
});

module.exports = router;
