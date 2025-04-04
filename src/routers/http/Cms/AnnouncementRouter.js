const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const AnnouncementController = require("@HttpControllers/Cms/AnnouncementController");

router.get("/", (req, res) => {
  AnnouncementController.listAnnouncement(req, res);
});

router.get("/delete/:id", (req, res) => {
  AnnouncementController.deleteAnnouncement(req, res);
});

router.get("/announcement-info/:id", (req, res) => {
  AnnouncementController.announcementInfo(req, res);
});

router.post("/update/:id", (req, res) => {
  AnnouncementController.Action.update(req, res);
});

router.post("/create", (req, res) => {
  AnnouncementController.Action.create(req, res);
});

module.exports = router;
