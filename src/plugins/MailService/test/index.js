var nodemailer = require('nodemailer'); // khai báo sử dụng module nodemailer

var transporter = nodemailer.createTransport({
    host: 'mailserver38.tino.org',
    port: 465,
    auth: {
        user: 'cskh@gold99b.com',
        pass: '139HDkaueH3J'
    }
});

var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
    from: 'Cskh@Gold99b.Com',
    to: 'mm13571234@gmail.com',
    subject: 'Quý khách nhiều trải nghiệm cũng như',
    text: 'Nhằm phục vụ khách hàng tốt hơn, mang đến cho Quý khách nhiều trải nghiệm cũng như để Quý khách nhận được nhiều giá trị sử dụng tốt hơn. LeKhaMart gửi đến các gói tham gia chương trình thành viên gắn bó dựa trên mức chi tiêu hàng tháng của gia đình. Sau khi chọn gói phù hợp, Quý khách nhắn tin cho bộ phận CSKH để hoàn tất các thủ tục thanh toán gói đăng ký tại',
    html: 'Nhằm 2 phục vụ khách hàng tốt hơn, mang đến cho Quý khách nhiều trải nghiệm cũng như để Quý khách nhận được nhiều giá trị sử dụng tốt hơn. LeKhaMart gửi đến các gói tham gia chương trình thành viên gắn bó dựa trên mức chi tiêu hàng tháng của gia đình. Sau khi chọn gói phù hợp, Quý khách nhắn tin cho bộ phận CSKH để hoàn tất các thủ tục thanh toán gói đăng ký tại'
}

transporter.sendMail(mainOptions, function (err, info) {
    if (err) {
        console.log(err);
    } else {
        console.log('Message sent: ' + info.response);
    }
});