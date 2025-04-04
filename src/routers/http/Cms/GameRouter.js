const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
// const middware = require('@Middwares/http/Authenticate');
const GameController = require("@HttpControllers/Cms/GameController");

router.get("/bet-history", (req, res) => {
  GameController.betHistory(req, res);
});
router.get("/bet-history/:id", (req, res) => {
  GameController.betHistoryByUser(req, res);
});
router.get("/gameAvalible", (req, res) => {
  GameController.gameAvalible(req, res);
});
router.get("/wallets/:id/:username", (req, res) => {
  GameController.wallets(req, res);
});

module.exports = router;
