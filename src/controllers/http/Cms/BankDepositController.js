const {
  ERROR_PAGE,
  ERROR_FORM,
  ERROR_AUTH,
  ERROR_AUTH_MESSAGE,
  ERROR_MESSAGES
} = require("@Helpers/contants");

const { BankListModel } = require("@Models/Bank/BankList");
const { BankHistoryModel } = require("@Models/Bank/BankHistory");
const BankListDeposit = require("@Configs/payment/BankDeposit.json");
const { BankUserModel } = require("@Models/Bank/BankUser");

module.exports = {
  listBankDeposit: async (req, res) => {
    try {
      const BankList = await BankListModel.findAll();
      res.status(200).json({
        status: true,
        data: BankList,
        msg: "Success",
        code: 200
      });
    } catch (e) {
      console.log(e);
      res.status(200).json({
        status: false,
        msg: e.message,
        code: 500
      });
    }
  },
  createBankDeposit: async (req, res) => {
    try {
      const { bankProvide, bankNumber, bankName } = req.body;

      const createBankDeposite = await BankListModel.create({
        bankProvide,
        bankNumber,
        bankName
      });
      if (!!createBankDeposite) {
        res.status(200).json({
          status: true,
          data: createBankDeposite,
          msg: "Success",
          code: 200
        });
      } else {
        res.status(200).json({
          status: false,
          msg: "Không thể thêm ngân hàng!",
          code: 503
        });
      }
    } catch (e) {
      console.log(e);
      res.status(200).json({
        status: false,
        msg: e.message,
        code: 500
      });
    }
  },
  deleteBankDeposit: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(200).json({
          status: false,
          msg: "Missing Param Bank ID"
        });
      }

      if (!Number(id) >> 0) {
        return res.status(200).json({
          status: false,
          msg: "Err Bank ID"
        });
      }

      const bank = await BankListModel.findOne({ where: { id } });

      if (!!bank) {
        const deleteBankDeposit = await BankListModel.destroy({
          where: { id: bank.id },
          force: true
        });

        if (!!deleteBankDeposit) {
          return res.status(200).json({
            status: true,
            data: null,
            msg: "Success"
          });
        } else {
          return res.status(200).json({
            status: false,
            msg: "Err Delete Bank Deposit"
          });
        }
      } else {
        return res.status(200).json({
          status: false,
          msg: "Bank not found"
        });
      }
    } catch (e) {
      console.log(e);
      res.status(200).json({
        status: false,
        msg: e.message,
        code: 500
      });
    }
  }
};
