const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const PaymentController = require("@HttpControllers/Client/PaymentController");

// lấy danh sách bank gửi từ đâu
router.get("/getListManualBank", (req, res) => {
  PaymentController.getListManualBank(req, res);
});
// lấy danh sách bank nạp thụ động của admin
// router.get("/getListBankDeposit", (req, res) => {
//   PaymentController.getListBankDeposit(req, res);
// });
// lấy danh sách bank nạp thụ động của admin
router.get("/getListBankDeposit", (req, res) => {
  PaymentController.getListBankDeposit(req, res);
});
// lấy danh sách bank tự động từ bên thứ ba
router.get("/getListAutoBankDeposit", (req, res) => {
  PaymentController.Action.getActiveAutoService(req, res);
});
// lấy nội dung thông tin nạp cho client từ bank thụ động bởi id bank
router.get("/getDataRequestManualBank/:id", (req, res) => {
  PaymentController.getDataRequestManualBank(req, res);
});
// tạo lệnh nạp tiền
router.post("/createRequestManualBank", (req, res) => {
  PaymentController.createRequestManualBank(req, res);
});
// tạo lệnh nạp tiền tự động bank
router.post("/createRequestAutoBank", (req, res) => {
  PaymentController.Action.createRequestAutoBank(req, res);
});
// tạo lệnh nạp tiền tự động ví điện tử
router.post("/createRequestAutoWallet", (req, res) => {
  PaymentController.Action.createRequestAutoWallet(req, res);
});
// tạo lệnh nạp tiền tự động ví USDT
router.post("/createRequestAutoUsdt", (req, res) => {
  PaymentController.Action.createRequestAutoUsdt(req, res);
});
// lấy danh sách card code & card value bên thứ ba
router.get("/getListAutoCardDeposit", (req, res) => {
  PaymentController.Action.getActiveAutoCardService(req, res);
});
// tạo lệnh nạp tiền tự động thẻ cào
router.post("/createRequestAutoCard", (req, res) => {
  PaymentController.Action.createRequestAutoCard(req, res);
});
// sử dụng mã khuyến mãi Giftcode
router.post("/createRequestUsePromotionCode", (req, res) => {
  PaymentController.Action.createRequestUsePromotionCode(req, res);
});
// lấy danh sách bank đã thêm của user
router.get("/getListUserBank", (req, res) => {
  PaymentController.getListUserBank(req, res);
});
// user thêm bank của mình để tạo lệnh rút tiền
router.post("/userAddBank", (req, res) => {
  PaymentController.userAddBank(req, res);
});
// lấy danh sách bank rút tự động của bên thứ ba
router.get("/getListBankWithdraw", (req, res) => {
  PaymentController.getListBankWithdraw(req, res);
});
// lấy điều kiện rút tiền
router.get("/getWithdrawalConditions", (req, res) => {
  PaymentController.getWithdrawalConditions(req, res);
});

//tạo lệnh rút tiền
router.post("/createRequestWithdraw", (req, res) => {
  PaymentController.createRequestWithdraw(req, res);
});
// lấy lịch sử
router.get("/history", (req, res) => {
  PaymentController.transactionHistory(req, res);
});
// lấy lịch sử card
router.get("/historyCard", (req, res) => {
  PaymentController.transactionHistoryCard(req, res);
});

module.exports = router;
