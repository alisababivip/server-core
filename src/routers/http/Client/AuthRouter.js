const { ERROR_PAGE } = require('@Helpers/contants');
const router = require('express').Router();
const middware = require('@Middwares/http/Authenticate');
const AuthController = require('@HttpControllers/Client/AuthController');

router.post('/login', (req, res) => {
    AuthController.login(req, res);
});

router.post('/register', (req, res) => {
    AuthController.register(req, res);
});

router.get('/me', middware, (req, res) => {
    AuthController.me(req, res);
});

router.post('/change-password', middware, (req, res) => {
    AuthController.changePassword(req, res);
});

router.post('/change-password-security', middware, (req, res) => {
    AuthController.changePasswordSecurity(req, res);
});

router.get('/check-security-passwd', middware, (req, res) => {
    AuthController.checkSecurityPasswd(req, res);
});
router.post('/forgot-password', (req, res) => {
    AuthController.forgotPassword(req, res);
});


module.exports = router;