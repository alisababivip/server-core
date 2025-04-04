const captcha = require("@Plugins/Captcha");

module.exports = async function (req, res) {
    const createCaptcha = await captcha();
    if (createCaptcha.status) {
        req.session.captcha = createCaptcha.text;
        return res.status(200).json({
            status: true,
            captcha: createCaptcha.data
        });
    }else {
        return res.status(200).json({
            status: false
        });
    }
};