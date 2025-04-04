const { Op } = require("sequelize");
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
const configGate = require('@Configs/payment/autoGateBank.json');
const paymentAutoService = require('@Plugins/OngchuaPaymentService');

module.exports = {
  listWithdraw: async (req, res) => {
    try {
      const page = parseInt(req.query.page, true)
        ? parseInt(req.query.page, true)
        : 0;
      const kmess = parseInt(req.query.limit, true)
        ? parseInt(req.query.limit, true)
        : 0;

      if (!!page && !!kmess) {
        let match = {};
        match.type = BankHistoryModel.TYPE_ENUM.CASHOUT;

        // filter
        if (!!req.query.bankName) {
          match.bankName = { [Op.like]: `%${req.query.bankName}%` };
        }
        if (!!req.query.bankProvide) {
          match.bankProvide = { [Op.like]: `%${req.query.bankProvide}%` };
        }
        if (!!req.query.bankNumber) {
          match.bankNumber = { [Op.like]: `%${req.query.bankNumber}%` };
        }
        if (!!req.query.transId) {
          match.transId = req.query.transId;
        }
        if (!!req.query.amount) {
          match.amount = req.query.amount;
        }
        if (!!req.query.status) {
          match.status = req.query.status;
        }

        const total = await BankHistoryModel.count({ where: match });
        const getData = await BankHistoryModel.findAll({
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
  deleteWithdraw: async (req, res) => {
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
  withdrawInfo: async (req, res) => {
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

      const withdraw = await BankHistoryModel.findOne({
        where: { id, type: BankHistoryModel.TYPE_ENUM.CASHOUT },
        attributes: { exclude: ["deletedAt", "type"] },
        include: [
          {
            model: UserModel,
            as: "userInfo",
            attributes: { exclude: ["password", "id", "role", "deletedAt"] }
          }
        ]
      });

      if (!!withdraw) {
        return res.status(200).json({
          status: true,
          data: withdraw,
          msg: "success"
        });
      } else {
        return res.status(200).json({
          status: false,
          msg: "Withdraw not found"
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

        const withdraw = await BankHistoryModel.findOne({
          where: { id, type: BankHistoryModel.TYPE_ENUM.CASHOUT },
          attributes: { exclude: ["deletedAt", "type"] }
        });
        const user = await findByID(withdraw.uid);


        if (!!withdraw && !!user) {
          user.isPlay = UserModel.IS_PLAY_ENUM.FALSE;
          if (withdraw.status !== status) {
            if (status === BankHistoryModel.STATUS_ENUM.ERROR) {
              // trả lại tiền
              user.coin += Number(withdraw.amount);
              withdraw.status = status;
              await withdraw.save();
              await withdraw.reload();
              await user.save();
              await user.reload();

            } else if (withdraw.status === BankHistoryModel.STATUS_ENUM.ERROR) {
              // trừ tiền
              user.coin -= Number(withdraw.amount);
              withdraw.status = status;
              await withdraw.save();
              await withdraw.reload();
              await user.save();
              await user.reload();
            }

            if (status === BankHistoryModel.STATUS_ENUM.SUCCESS) {
              // thành công
              let createRequestWithdraw = null;
              if (withdraw.bankProvide == "MOMO") {
                createRequestWithdraw = await paymentAutoService.WITHDRAW.createRequestWithdrawMomo(
                  withdraw.transId,
                  Number(withdraw.amount),
                  withdraw.bankNumber
                );
              } else {
                createRequestWithdraw = await paymentAutoService.WITHDRAW.createRequestWithdrawBank(
                  withdraw.transId,
                  Number(withdraw.amount),
                  withdraw.bankProvide,
                  withdraw.bankNumber,
                  Helper.nonAccentVietnamese(withdraw.bankName)
                );
              }

              if (!!createRequestWithdraw) {
                if (createRequestWithdraw.status == 1) {
                  withdraw.status = status;
                  await withdraw.save();
                  await withdraw.reload();
                  return res.status(200).json({
                    status: true,
                    msg: "Cập nhật thành công!",
                    code: 200,
                    data: createRequestWithdraw
                  });
                } else {
                  await user.save();
                  await user.reload();
                  return res.status(200).json({
                    status: false,
                    msg: `Error: ${createRequestWithdraw.msg}`,
                    err_code: status.msg,
                    code: 500
                  });
                }
              } else {
                await user.save();
                await user.reload();
                return res.status(200).json({
                  status: false,
                  msg: "Có lỗi khi tạo yêu cầu đến bên thứ ba!!!",
                  err_code: status.msg,
                  code: 403
                });
              }
            }
          } else {
            return res.status(200).json({
              status: false,
              msg: `Bạn đã cập nhật trạng thái "${status.toUpperCase()}" cho đơn này rồi!`,
              code: 200
            });
          }
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
