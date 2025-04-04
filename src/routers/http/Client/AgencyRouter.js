const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const AgencyController = require("@HttpControllers/Client/AgencyController");

router.get("/countRefUser", (req, res) => {
    AgencyController.countRefererUser(req, res);
});

router.get("/countRefUserToday", (req, res) => {
    AgencyController.countRefererUserToday(req, res);
});

router.get("/myRefShare", (req, res) => {
    AgencyController.myRefShare(req, res);
});

router.get("/calculatorProfit", (req, res) => {
    AgencyController.calculatorProfit(req, res);
});

module.exports = router;
