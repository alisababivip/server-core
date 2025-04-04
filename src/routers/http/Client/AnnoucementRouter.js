const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const AnnoucementController = require("@HttpControllers/Client/AnnoucementController");

router.get("/", (req, res) => {
  AnnoucementController.listAnnoucement(req, res);
});

router.get("/annoucement-info/:id", (req, res) => {
  AnnoucementController.annoucementInfo(req, res);
});

router.get("/seen/:id", (req, res) => {
  AnnoucementController.Action.seen(req, res);
});

module.exports = router;
