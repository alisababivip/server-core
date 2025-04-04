const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const DepositController = require("@HttpControllers/Cms/DepositController");

router.get("/", (req, res) => {
  DepositController.listDeposit(req, res);
});

router.get("/delete/:id", (req, res) => {
  DepositController.deleteDeposit(req, res);
});

router.get("/deposit-info/:id", (req, res) => {
  DepositController.depositInfo(req, res);
});

router.post("/update/:id", (req, res) => {
  DepositController.Action.update(req, res);
});

module.exports = router;
