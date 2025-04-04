const { Op } = require("sequelize");
const {
  ERROR_PAGE,
  ERROR_FORM,
  ERROR_AUTH,
  ERROR_AUTH_MESSAGE,
  ERROR_MESSAGES
} = require("@Helpers/contants");
const { parseInt } = require("@Helpers/Number");
const { findByID, findByUsername, UserModel } = require("@Models/User/User");
const { BankHistoryModel } = require("@Models/Bank/BankHistory");
const BankListDeposit = require("@Configs/payment/BankDeposit.json");
const { BankUserModel } = require("@Models/Bank/BankUser");
const { MessageModel } = require("@Models/Message/Message");

module.exports = {
  listMessage: async (req, res) => {
    try {
      const page = parseInt(req.query.page, true)
        ? parseInt(req.query.page, true)
        : 0;
      const kmess = parseInt(req.query.limit, true)
        ? parseInt(req.query.limit, true)
        : 0;

      if (!!page && !!kmess) {
        let match = {};
        match.type = MessageModel.TYPE_ENUM.USER;

        // filter
        if (!!req.query.title) {
          match.title = { [Op.like]: `%${req.query.title}%` };
        }
        if (!!req.query.content) {
          match.content = { [Op.like]: `%${req.query.content}%` };
        }

        const total = await MessageModel.count({ where: match });
        const getData = await MessageModel.findAll({
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
  deleteMessage: async (req, res) => {
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

      const message = await MessageModel.findOne({ where: { id } });

      if (!!message) {
        const deleteMessage = await MessageModel.destroy({
          where: { id: message.id },
          force: true
        });

        if (!!deleteMessage) {
          return res.status(200).json({
            status: true,
            data: null,
            msg: "Success"
          });
        } else {
          return res.status(200).json({
            status: false,
            msg: "Err Delete Message"
          });
        }
      } else {
        return res.status(200).json({
          status: false,
          msg: "Message not found"
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
  messageInfo: async (req, res) => {
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
          if (withdraw.status !== status) {
            if (status === BankHistoryModel.STATUS_ENUM.ERROR) {
              // trả lại tiền
              user.coin += Number(withdraw.amount);
              withdraw.status = status;
              withdraw.save();
              withdraw.reload();
            } else if (withdraw.status === BankHistoryModel.STATUS_ENUM.ERROR) {
              // trừ tiền
              user.coin -= Number(withdraw.amount);
              withdraw.status = status;
              withdraw.save();
              withdraw.reload();
            }
            user.save();
            user.reload();
          }

          if (status == 1) {
            // rút thủ công
            withdraw.status = status;
            withdraw.save();
          }

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
    },
    create: async (req, res) => {
      try {
        const { username, title, content } = req.body;
        const user = await findByUsername(username);

        if (!!user) {
          const createMessage = await MessageModel.create({
            type: MessageModel.TYPE_ENUM.USER,
            uid: user.id,
            title,
            content
          });

          if (!!createMessage) {
            res.status(200).json({
              status: true,
              data: createMessage,
              msg: "Gửi tin nhắn thành công!",
              code: 200
            });
          } else {
            res.status(200).json({
              status: false,
              msg: "Can't create message!",
              code: 400
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
