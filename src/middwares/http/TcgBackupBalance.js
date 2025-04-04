const {
  getTotalBalance,
  resetBalanceToZero,
  backupBalanceByUser
} = require("@Services/TcgService/helpers");

module.exports = async (req, res, next) => {
  try {
    console.log(req.session);
  } catch (e) {}
};
