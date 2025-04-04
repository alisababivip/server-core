const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const WithdrawController = require("@HttpControllers/Agent/WithdrawController");

router.get("/", (req, res) => {
  WithdrawController.listWithdraw(req, res);
});

router.get("/delete/:id", (req, res) => {
  WithdrawController.deleteWithdraw(req, res);
});

router.get("/withdraw-info/:id", (req, res) => {
  WithdrawController.withdrawInfo(req, res);
});

router.post("/update/:id", (req, res) => {
  WithdrawController.Action.update(req, res);
});

module.exports = router;
