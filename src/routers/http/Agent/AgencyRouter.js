const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const AgencyController = require("@HttpControllers/Agent/AgencyController");

router.get("/", (req, res) => {
    AgencyController.listAgency(req, res);
});

router.get("/:agencyId", (req, res) => {
    AgencyController.listAgencyByAgencyId(req, res);
});

router.get("/list-username", (req, res) => {
    AgencyController.listUsername(req, res);
});

router.get("/agency-info/:id", (req, res) => {
    AgencyController.AgencyInfo(req, res);
});

router.get("/delete/:id", (req, res) => {
    AgencyController.deleteAgency(req, res);
});

router.post("/update/:id", (req, res) => {
    AgencyController.Action.update(req, res);
});

router.get("/countRefUser/:id", (req, res) => {
    AgencyController.countRefererUser(req, res);
});

router.get("/countRefUserToday/:id", (req, res) => {
    AgencyController.countRefererUserToday(req, res);
});

router.get("/getProfit/:id", (req, res) => {
    AgencyController.calculatorProfit(req, res);
});

router.get("/getLevelList/:id", (req, res) => {
    AgencyController.getLevelListAgency(req, res);
});


module.exports = router;
