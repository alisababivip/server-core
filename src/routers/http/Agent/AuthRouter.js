const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const middware = require("@Middwares/http/AgentAuthenticate");
const AuthController = require("@HttpControllers/Agent/AuthController");

router.post("/login", (req, res) => {
  AuthController.login(req, res);
});

router.get("/me", middware, (req, res) => {
  AuthController.me(req, res);
});

router.post("/change-password", middware, (req, res) => {
  AuthController.changePassword(req, res);
});

module.exports = router;
