const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const middware = require('@Middwares/http/Authenticate');
const TreeController = require("@HttpControllers/Client/CreateTreeController");

router.get("/:id", (req, res) => {
    TreeController.getTreeArrayByAgency(req, res);
});

module.exports = router;