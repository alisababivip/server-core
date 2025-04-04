const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const UserController = require("@HttpControllers/Agent/UserController");

router.get("/", (req, res) => {
  UserController.listUser(req, res);
});

router.get("/list-username", (req, res) => {
  UserController.listUsername(req, res);
});

router.get("/user-info/:id", (req, res) => {
  UserController.userInfo(req, res);
});

router.get("/delete/:id", (req, res) => {
  UserController.deleteUser(req, res);
});

router.post("/update/:id", (req, res) => {
  UserController.Action.update(req, res);
});

module.exports = router;
