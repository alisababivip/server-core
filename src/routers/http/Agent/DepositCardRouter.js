const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const DepositCardController = require("@HttpControllers/Agent/DepositCardController");

router.get("/", (req, res) => {
    DepositCardController.listDeposit(req, res);
});

router.get("/delete/:id", (req, res) => {
    DepositCardController.deleteDeposit(req, res);
});

router.get("/deposit-info/:id", (req, res) => {
    DepositCardController.depositInfo(req, res);
});

router.post("/update/:id", (req, res) => {
    DepositCardController.Action.update(req, res);
});

module.exports = router;
