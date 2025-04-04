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
const subnamesConfig = require("@Configs/game/subnamesConfig.json");
const gameConfig = require("@Configs/game/gameConfig.json");
const TcgConfig = require("@Configs/game/tcgGaming.json");
const TcgService = require("@Plugins/TcgService");
const { findByID, findByUsername, UserModel } = require("@Models/User/User");
const { BetHistoryModel } = require("@Models/Bet/BetHistory");

module.exports = {
  betHistory: async (req, res) => {
    try {
      const page = parseInt(req.query.page, true)
        ? parseInt(req.query.page, true)
        : 0;
      const kmess = parseInt(req.query.limit, true)
        ? parseInt(req.query.limit, true)
        : 0;

      if (!!page && !!kmess) {
        let match = {};

        // filter
        if (!!req.query.username) {
          match.username = req.query.username;
        }
        if (!!req.query.transid) {
          match.betOrderNo = req.query.transid;
        }
        if (!!req.query.game) {
          match.gameCode = req.query.game;
        }
        if (!!req.query.round) {
          match.sessionId = req.query.round;
        }

        const total = await BetHistoryModel.count({ where: match });
        const getData = await BetHistoryModel.findAll({
          where: match,
          offset: 0 + (page - 1) * kmess,
          limit: kmess,
          order: [["betTime", "DESC"]],
          attributes: { exclude: ["deletedAt"] },
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
  betHistoryByUser: async (req, res) => {
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

      const page = parseInt(req.query.page, true)
        ? parseInt(req.query.page, true)
        : 0;
      const kmess = parseInt(req.query.limit, true)
        ? parseInt(req.query.limit, true)
        : 0;

      if (!!page && !!kmess) {
        let match = {};
        // filter
        match.uid = id;

        if (!!req.query.transid) {
          match.betOrderNo = req.query.transid;
        }
        if (!!req.query.game) {
          match.gameCode = req.query.game;
        }
        if (!!req.query.round) {
          match.sessionId = req.query.round;
        }

        const total = await BetHistoryModel.count({ where: match });
        const getData = await BetHistoryModel.findAll({
          where: match,
          offset: 0 + (page - 1) * kmess,
          limit: kmess,
          order: [["betTime", "DESC"]],
          attributes: { exclude: ["deletedAt"] },
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
  gameAvalible: async (req, res) => {
    try {
      res.status(200).json({
        status: true,
        data: gameConfig,
        msg: "success",
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
  wallets: async (req, res) => {
    try {
      const { id, username } = req.params;
      if (!id || !username) {
        return res
          .status(200)
          .json({ status: false, msg: "Error Missing Param!" });
      }

      if (id == "SITEWALLET") {
        return res.status(200).json({
          status: true,
          balance: req.user.coin,
          msg: "success",
          code: 200
        });
      }


      if (!subnamesConfig.includes(id)) {
        return res
          .status(200)
          .json({ status: false, msg: "Error Param ID Not Accept!" });
      }

      if (!gameConfig.hasOwnProperty(id.toUpperCase())) {
        return res.status(200).json({ status: false, msg: "Game Invalid!" });
      }

      const tcgService = new TcgService(Helper.getValueOfKeyObject(TcgConfig, gameConfig[id.toUpperCase()].config));

      const getBalance = await tcgService.getBalance(
        username,
        gameConfig[id.toUpperCase()].type
      );

      if (getBalance) {
        if (getBalance.status == 0) {
          res.status(200).json({
            status: true,
            balance: getBalance.balance,
            msg: "success",
            code: 200
          });
        } else {
          res.status(200).json({
            status: false,
            msg: getBalance.error_desc,
            code: 500
          });
          return;
        }
      } else {
        res.status(200).json({
          status: false,
          msg: `Đã có lỗi bất ngờ xảy ra! Vui lòng thao tác lại...`,
          code: 500
        });
        return;
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
  Action: {}
};
