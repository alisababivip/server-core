const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const BankDepositController = require("@HttpControllers/Cms/BankDepositController");

router.get("/", (req, res) => {
  BankDepositController.listBankDeposit(req, res);
});

router.post("/create", (req, res) => {
  BankDepositController.createBankDeposit(req, res);
});

router.get("/delete/:id", (req, res) => {
  BankDepositController.deleteBankDeposit(req, res);
});
module.exports = router;
