const {
  ERROR_PAGE,
  ERROR_FORM,
  ERROR_AUTH,
  ERROR_AUTH_MESSAGE,
  ERROR_MESSAGES
} = require("@Helpers/contants");
const Helper = require("@Helpers/helpers");
const { parseInt } = require("@Helpers/Number");
const { findByID, UserModel } = require("@Models/User/User");
const { BankHistoryModel } = require("@Models/Bank/BankHistory");
const { AgencyModel } = require("@Models/Agency/Agency");
const { AgencyRefModel } = require("@Models/Agency/AgencyRef");

module.exports = {
  listDeposit: async (req, res) => {
    try {
      const page = parseInt(req.query.page, true)
        ? parseInt(req.query.page, true)
        : 0;
      const kmess = parseInt(req.query.limit, true)
        ? parseInt(req.query.limit, true)
        : 0;

      if (!!page && !!kmess) {
        let match = {};
        let assocScopes = [];

        let getAgencyUser = await AgencyRefModel.findAll({
          where: { agency: req.agency.id },
          attributes: ["uid"]
        });
        match.uid = [];
        getAgencyUser.forEach((user) => match.uid.push(user.uid));

        match.type = BankHistoryModel.TYPE_ENUM.RECHARGE;

        // filter
        if (!!req.query.bankName) assocScopes.push({ method: ['bySearchBankName', req.query.bankName] });
        if (!!req.query.bankProvide) assocScopes.push({ method: ['bySearchBankProvide', req.query.bankProvide] });
        if (!!req.query.bankNumber) assocScopes.push({ method: ['bySearchBankNumber', req.query.bankNumber] });
        if (!!req.query.transId) assocScopes.push({ method: ['bySearchTransId', req.query.transId] });
        if (!!req.query.amount) assocScopes.push({ method: ['bySearchAmount', req.query.amount] });
        if (!!req.query.status) assocScopes.push({ method: ['bySearchStatus', req.query.status] });
        if (!!req.query.username) assocScopes.push({ method: ['bySearchUsername', req.query.username] });

        const total = await BankHistoryModel.scope(assocScopes).count({ where: match });
        const getData = await BankHistoryModel.scope(assocScopes).findAll({
          where: match,
          offset: 0 + (page - 1) * kmess,
          limit: kmess,
          order: [["id", "DESC"]],
          attributes: { exclude: ["deletedAt", "type"] },
          include: [
            {
              model: UserModel,
              as: "userInfo",
              attributes: { exclude: ["password", "id", "role", "deletedAt"] }
            }
          ]
        });

        res.status(200).json({
          status: true,
          data: {
            dataExport: getData,
            page: page,
            kmess: kmess,
            total: total
          },
          msg: "SUCCESS"
        });
      } else {
        res.status(200).json({
          status: false,
          msg: ERROR_FORM.MISSING_FIELD
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
  deleteDeposit: async (req, res) => {
    try {
      return res.status(200).json({
        status: false,
        msg: "Hành động không được phép!"
      });
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

      const bank = await BankHistoryModel.findOne({ where: { id } });

      if (!!bank) {
        const deleteBankDeposit = await BankHistoryModel.destroy({
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
  },
  depositInfo: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(200).json({
          status: false,
          msg: "Missing Param ID"
        });
      }

      if (!Number(id) >> 0) {
        return res.status(200).json({
          status: false,
          msg: "Err ID"
        });
      }

      const deposit = await BankHistoryModel.findOne({
        where: { id, type: BankHistoryModel.TYPE_ENUM.RECHARGE },
        attributes: { exclude: ["deletedAt", "type"] },
        include: [
          {
            model: UserModel,
            as: "userInfo",
            attributes: { exclude: ["password", "id", "role", "deletedAt"] }
          }
        ]
      });

      if (!!deposit) {
        return res.status(200).json({
          status: true,
          data: deposit,
          msg: "success"
        });
      } else {
        return res.status(200).json({
          status: false,
          msg: "Deposit not found"
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
  Action: {
    update: async (req, res) => {
      try {
        return res.status(200).json({
          status: false,
          msg: "Hành động không được phép!"
        });
        const { id } = req.params;

        if (!id) {
          return res.status(200).json({
            status: false,
            msg: "Missing Param ID"
          });
        }

        if (!Number(id) >> 0) {
          return res.status(200).json({
            status: false,
            msg: "Err ID"
          });
        }

        const { status } = req.body;

        const deposit = await BankHistoryModel.findOne({
          where: { id, type: BankHistoryModel.TYPE_ENUM.RECHARGE },
          attributes: { exclude: ["deletedAt", "type"] }
        });
        const user = await findByID(deposit.uid);

        if (!!deposit && !!user) {
          if (deposit.status !== status) {
            if (status === BankHistoryModel.STATUS_ENUM.SUCCESS) {
              // Thành công
              user.coin += Number(deposit.amount);
              // set lại trạng thái đã chơi tránh trường hợp vừa nạp tiền xong đã bị về 0
              user.isPlay = UserModel.IS_PLAY_ENUM.FALSE;
            }
          }

          deposit.status = status;
          await deposit.save();
          await deposit.reload();
          await user.save();
          await user.reload();

          res.status(200).json({
            status: true,
            msg: "Cập nhật thành công!",
            code: 200
          });
        } else {
          res.status(200).json({
            status: false,
            msg: "User not found!",
            code: 400
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
  }
};
