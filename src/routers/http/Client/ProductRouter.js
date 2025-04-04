const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
// const middware = require('@Middwares/http/Authenticate');
const ProductController = require("@HttpControllers/Client/ProductController");

router.get("/", (req, res) => {
    ProductController.index(req, res);
});

router.get("/:productType/:gameType", (req, res) => {
    ProductController.category(req, res);
});

router.get("/dev/:productType/:gameType", (req, res) => {
    ProductController.categoryTest(req, res);
})

router.get("/fish", (req, res) => {
    ProductController.fish(req, res);
});

module.exports = router;