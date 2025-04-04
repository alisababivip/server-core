const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const DashboardController = require("@HttpControllers/Cms/DashboardController");

router.get("/", (req, res) => {
    DashboardController.index(req, res);
});

router.get("/statis", (req, res) => {
    DashboardController.Statis(req, res);
});

router.get("/calculate", (req, res) => {
    DashboardController.Calculate(req, res);
});

router.get("/sum-balance", (req, res) => {
    DashboardController.SumBalance(req, res);
});

module.exports = router;
