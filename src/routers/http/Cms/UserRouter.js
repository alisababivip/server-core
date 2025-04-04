const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const UserController = require("@HttpControllers/Cms/UserController");

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

router.post("/change-password/:id", (req, res) => {
  UserController.Action.changePassword(req, res);
});

router.get("/getListUserBank/:id", (req, res) => {
  UserController.getListUserBank(req, res);
});

router.post("/updateBankUser/:id", (req, res) => {
  UserController.updateBankUser(req, res);
});

router.post("/deleteBankUser/:id", (req, res) => {
  UserController.deleteBankUser(req, res);
});

module.exports = router;
