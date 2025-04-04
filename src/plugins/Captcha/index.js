const svgCaptcha = require("svg-captcha");
const svgToImg = require("svg-to-img");

module.exports = async function (options = null) {
    if (options == null) {
        options = {
            // width: 200,
            // height: 100,
            fontSize: 30,
            size: 6, // kích thước của chuỗi ngẫu nhiên
            noise: 1, // số dòng nhiễu
            color: true, // các ký tự sẽ có màu riêng biệt thay vì màu xám, đúng nếu tùy chọn background được đặt
            //background: '#cc9966'
        };
    }

    svgCaptcha.loadFont(`${__dirname}/Fonts/Libre/LibreBaskerville-Regular.ttf`);
    const createCaptcha = svgCaptcha.create(options);

    if (hasOwnProperty.call(createCaptcha, "text") && hasOwnProperty.call(createCaptcha, "data")) {
        const pngCaptcha = await svgToImg.from(createCaptcha.data).toPng({ encoding: "base64" });
        return {
            status: true,
            text: createCaptcha.text,
            data: `data:image/png;base64,${pngCaptcha}`
        };
    } else {
        return {
            status: false
        };
    }
}