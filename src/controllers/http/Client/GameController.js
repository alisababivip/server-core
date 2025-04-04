const {
  ERROR_PAGE,
  ERROR_FORM,
  ERROR_AUTH,
  ERROR_AUTH_MESSAGE,
  ERROR_MESSAGES
} = require("@Helpers/contants");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const { Op } = require("sequelize");
const Helper = require("@Helpers/helpers");
const { parseInt } = require("@Helpers/Number");
const config = require("@Config");
const TcgConfig = require("@Configs/game/tcgGaming.json");
const TcgService = require("@Plugins/TcgService");
const subnamesConfig = require("@Configs/game/subnamesConfig.json");
const gameConfig = require("@Configs/game/gameConfig.json");
const { BetHistoryModel } = require("@Models/Bet/BetHistory");
const { findByID, findByUsername, UserModel } = require("@Models/User/User");
const addTaskBackupBet = require("@Services/TcgService/addTaskBackupBet");
const addTaskBackupBalance = require("@Services/TcgService/addTaskBackupBalance");
const {
  getTotalBalance,
  resetBalanceToZero,
  backupBalanceByUser
} = require("@Services/TcgService/helpers");

module.exports = {
  subnames: async (req, res) => {
    try {
      res.status(200).json({
        status: true,
        data: subnamesConfig.sort(),
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
  launchGame: async (req, res) => {
    try {
      const { id } = req.params;
      const { code, platform } = req.query;

      if (!id || !code) {
        return res
          .status(200)
          .json({ status: false, msg: "Error Missing Params!" });
      }

      if (!subnamesConfig.includes(id)) {
        return res
          .status(200)
          .json({ status: false, msg: "Trò chơi này hiện tại không khả dụng! Xin trân thành xin lỗi quý khách hàng vì sự thiếu sót này." });
      }

      if (!gameConfig.hasOwnProperty(id.toUpperCase())) {
        return res.status(200).json({ status: false, msg: "Trò chơi không hợp lệ!" });
      }

      let getGame = null;
      let platformClient = platform == "mobile" ? "html5" : "html5-desktop";
      let platformClientLottery = platform == "mobile" ? "MOBILE" : "WEB";
      let backUrl = platform == "mobile" ? `https://m.${config.SITE_DOMAIN}` : `https://www.${config.SITE_DOMAIN}`;
      const LotteryGameCode = "TCG_VNLOTT";

      if (id.toUpperCase() == LotteryGameCode) {         // xoso
        // get play game data
        let getLaunchGameParams = {
          username: req.user.username,
          product_type: gameConfig[LotteryGameCode].type,
          game_mode: "1",
          game_code: "lobby",
          lottery_bet_mode: "Elott",
          view: "lobby",
          language: "VI",
          back_url: backUrl,
          platform: platformClientLottery,
          method: 'lg',
        };
        const tcgService = new TcgService(Helper.getValueOfKeyObject(TcgConfig, gameConfig[LotteryGameCode].config));
        getGame = await tcgService.postAPI(getLaunchGameParams);
      } else {
        const tcgService = new TcgService(Helper.getValueOfKeyObject(TcgConfig, gameConfig[id.toUpperCase()].config));
        getGame = await tcgService.getLaunchGame(
          req.user.username,
          gameConfig[id.toUpperCase()].type,
          gameConfig[id.toUpperCase()].mode,
          code,
          platformClient
        );
      }

      console.log(getGame);

      if (getGame) {
        if (getGame.status == 0) {
          //addTaskBackupBet(req.user.username);
          //addTaskBackupBalance(req.user.username);

          const user = await findByUsername(req.user.username);
          user.isPlay = UserModel.IS_PLAY_ENUM.TRUE;
          user.save();
          user.reload();

          let playUrl = id.toUpperCase() == LotteryGameCode ? `https://lottery.${config.SITE_DOMAIN}/${getGame.game_url}` : getGame.game_url;

          // let playUrl = getGame.game_url;

          res.status(200).json({
            status: true,
            data: {
              playUrl
            },
            msg: "success",
            code: 200
          });
        } else {
          res.status(200).json({
            status: false,
            msg: getGame.error_desc,
            code: 3812,
            detail: getGame
          });
          return;
        }
      } else {
        res.status(200).json({
          status: false,
          msg: `Khởi chạy trò chơi thất bại!`,
          code: 49532,
          detail: "Error Get Launcher"
        });
        return;
      }

    } catch (e) {
      console.log(e);
      res.status(200).json({
        status: false,
        msg: e.message,
        code: "err_exception"
      });
      return;
    }
  },
  wallets: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res
          .status(200)
          .json({ status: false, msg: "Error Missing Param ID!" });
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
        req.user.username,
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
  history: async (req, res) => {
    try {
      const page = parseInt(req.query.page, true)
        ? parseInt(req.query.page, true)
        : 0;
      const kmess = parseInt(req.query.limit, true)
        ? parseInt(req.query.limit, true)
        : 0;

      if (!!page && !!kmess) {
        let match = {};
        match.uid = req.user.id;
        const from = (req.query.from) ? req.query.from : moment().startOf("year").format("DD/MM/YYYY");
        const to = (req.query.to) ? req.query.to : moment().format("DD/MM/YYYY");
        match.createdAt = {
          [Op.between]: [moment(from, "DD/MM/YYYY").startOf("days").format(), moment(to, "DD/MM/YYYY").endOf("days").format()]
        };

        // filter
        if (!!req.query.gameCategory) {
          match.gameCategory = req.query.gameCategory;
        }

        const total = await BetHistoryModel.count({ where: match });
        const getData = await BetHistoryModel.findAll({
          where: match,
          offset: 0 + (page - 1) * kmess,
          limit: kmess,
          order: [["betTime", "DESC"]],
          attributes: { exclude: ["deletedAt"] }
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
  walletTransfer: async (req, res) => {
    try {
      // const { amount, type, transferType, password } = req.body;
      // if (!amount || !type || !transferType || !password) {
      //   return res
      //     .status(200)
      //     .json({ status: false, msg: "Error Missing Param!" });
      // }

      // // Check Password 
      // const currentMd5Pass = await UserModel.findOne({ where: { id: req.user.id }, attributes: ["password"] });
      // if (!validatePassword(password, currentMd5Pass.password)) {
      //   return res.status(200).json({
      //     status: false,
      //     msg: ERROR_AUTH.PASSWORD_INVALID,
      //     code: 1
      //   });
      // }

      const { amount, type, transferType } = req.body;
      if (!amount || !type || !transferType) {
        return res
          .status(200)
          .json({ status: false, msg: "Error Missing Param!" });
      }


      if (Number(transferType) == 1) {
        const user = await findByID(req.user.id);
        if (user.coin < Number(amount)) {
          return res
            .status(200)
            .json({ status: false, msg: "Số dư của bạn không đủ!" });
        }

        const amountTransfer = Math.floor(Number(amount) / 1000);

        const gameConfigData = Helper.getGameConfigByType(gameConfig, type);

        const tcgService = new TcgService(
          Helper.getValueOfKeyObject(TcgConfig, gameConfigData.config)
        );

        const transfer = await tcgService.userTransfer(
          user.username,
          gameConfigData.type,
          1,
          amountTransfer,
          Helper.randomInteger(100000000000, 999999999999) // transID
        );

        if (transfer) {
          if (transfer.status == 0) {
            user.coin -= Number(amount);
            await user.save();
            await user.reload();
            return res
              .status(200)
              .json({ status: true, user, msg: "Chuyển quỹ thành công!" });
          } else {
            console.log("Nạp Responsive : " + JSON.stringify(transfer));
            res.status(200).json({
              status: false,
              msg: transfer.error_desc,
              code: 500
            });
          }
        } else {
          res.status(200).json({
            status: false,
            msg: `Đã có lỗi bất ngờ xảy ra! Vui lòng thao tác lại...`,
            code: 500
          });
        }
      } else if (Number(transferType) == 2) {
        const amountUpdate = Math.floor(Number(amount) * 1000);
        const user = await findByID(req.user.id);


        const gameConfigData = Helper.getGameConfigByType(gameConfig, type);

        const tcgService = new TcgService(
          Helper.getValueOfKeyObject(TcgConfig, gameConfigData.config)
        );

        const withDraw = await tcgService.userTransfer(
          user.username,
          gameConfigData.type,
          2,
          Number(amount),
          Helper.randomInteger(100000000000, 999999999999) // transID
        );

        if (withDraw) {
          if (withDraw.status == 0) {
            user.coin += amountUpdate;
            await user.save();
            await user.reload();
            return res
              .status(200)
              .json({ status: true, user, msg: "Rút quỹ thành công!" });
          } else {
            console.log("Rút Responsive : " + JSON.stringify(withDraw));
            res.status(200).json({
              status: false,
              msg: withDraw.error_desc,
              code: 500
            });
          }
        } else {
          res.status(200).json({
            status: false,
            msg: `Đã có lỗi bất ngờ xảy ra! Vui lòng thao tác lại...`,
            code: 500
          });
        }
      } else {
        res.status(200).json({
          status: false,
          msg: `Đã có lỗi bất ngờ xảy ra! Vui lòng thao tác lại...`,
          code: 500
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
  balanceUpdate: async (req, res) => {
    try {
      const user = req.user;
      // lấy tổng số dư tcg
      if (user.isPlay == UserModel.IS_PLAY_ENUM.TRUE) {
        // const tcgTotalBalance = await getTotalBalance(user.username);
        // if (tcgTotalBalance.status) {
        //   // tcgTotalBalance.totalBalance
        //   await backupBalanceByUser(user.username);
        // }
      }
      res.status(200).json({
        status: true
      });
    } catch (e) {
      console.log(e);
      res.status(200).json({
        status: true
      });
    }
  }
};
