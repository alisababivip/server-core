const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const BankController = require("@HttpControllers/Cms/BankController");

router.get("/withdraw", (req, res) => {
    BankController.listBankWithdraw(req, res);
});

module.exports = router;
