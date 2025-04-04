const fs = require('fs');
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const { Op } = require("sequelize");
const {
  SUCCESS,
  ERROR_PAGE,
  ERROR_FORM,
  ERROR_AUTH,
  ERROR_AUTH_MESSAGE,
  ERROR_MESSAGES,
  ERROR_CODES,
  PAYMENT_MESSAGE
} = require("@Helpers/contants");
const Helper = require("@Helpers/helpers");
const { validatePassword } = require("@Helpers/password");
const { parseInt } = require("@Helpers/Number");
const { numberWithCommas } = require("@Helpers/helpers");
const { randomString } = require("@Helpers/String");
const { BankListModel } = require("@Models/Bank/BankList");
const { BankHistoryModel } = require("@Models/Bank/BankHistory");
const BankListDeposit = require("@Configs/payment/BankDeposit.json");
const BankWithdraw = require("@Configs/payment/BankWithdraw.json");
const { BetHistoryModel } = require("@Models/Bet/BetHistory");
const { CardHistoryModel } = require("@Models/Card/CardHistory");
const { BankUserModel } = require("@Models/Bank/BankUser");
const { PasswdSecurityModel } = require("@Models/Security/PasswdSecurity");
const { WithdrawConditionModel } = require("@Models/Withdraw/WithdrawCondition");
const { findByID, UserModel } = require("@Models/User/User");
// const paymentAutoService = require('@Plugins/PaymentService');
const paymentAutoService = require('@Plugins/OngchuaPaymentService');
const teleBotSendMsg = require('@Plugins/TelegramBot');

module.exports = {
  getListManualBank: async (req, res) => {
    const List = await BankListModel.findAll({
      status: BankListModel.STATUS_ENUM.ACTIVE
    });
    return res.status(200).json({
      status: true,
      data: List,
      msg: "Success"
    });
  },
  getListBankDeposit: async (req, res) => {
    try {
      return res.status(200).json({
        status: true,
        data: BankWithdraw,
        msg: "Success"
      });
    } catch (e) {
      console.log(e);
      return res.status(200).json({
        status: false,
        data: [],
        msg: "Error Get List Bank Deposit"
      });
    }
  },
  getListBankWithdraw: async (req, res) => {
    try {
      return res.status(200).json({
        status: true,
        data: BankWithdraw,
        msg: SUCCESS
      });
    } catch (e) {
      console.log(e);
      return res.status(200).json({
        status: false,
        data: [],
        msg: ERROR_CODES.SomeErrorsOccurredPleaseTryAgain
      });
    }
  },
  getDataRequestManualBank: async (req, res) => {
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
      const BankRequestData = bank.toJSON();
      BankRequestData.content = "NAP " + req.user.username.toUpperCase();

      return res.status(200).json({
        status: true,
        data: BankRequestData,
        msg: "Success"
      });
    } else {
      return res.status(200).json({
        status: false,
        msg: "Bank not found"
      });
    }
  },
  createRequestManualBank: async (req, res) => {
    try {
      const {
        bank,
        bankDeposit,
        nameDeposit,
        numberDeposit,
        amountDeposit,
        transIdDeposit
      } = req.body;

      if (Number(amountDeposit) < 50000) {
        return res.status(200).json({
          status: false,
          msg: "Minimum deposit amount must be more than 50,000"
        });
      }

      const createDepositRequest = await BankHistoryModel.create({
        uid: req.user.id,
        bankProvide: bankDeposit,
        bankNumber: numberDeposit,
        bankName: nameDeposit,
        transId: transIdDeposit,
        type: BankHistoryModel.TYPE_ENUM.RECHARGE,
        amount: Number(amountDeposit),
        info: `Bank transfer ${bank}`,
        status: BankHistoryModel.STATUS_ENUM.PENDING
      });
      if (!!createDepositRequest) {
        return res.status(200).json({
          status: true,
          data: [],
          msg: "Deposit request created successfully!"
        });
      } else {
        return res.status(200).json({
          status: false,
          msg: "Error Insert Request Deposit!"
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(200).json({
        status: false,
        msg: "Error Create Request Deposit!"
      });
    }
  },
  userAddBank: async (req, res) => {
    try {
      const { bankProvide, bankName, bankNumber, bankBranch } = req.body;

      const bankUser = await BankUserModel.findOne({
        where: { uid: req.user.id }
      });
      if (bankUser) {
        return res.status(200).json({
          status: true,
          data: [],
          msg: PAYMENT_MESSAGE.ACCOUNT_UNIQUE_BANK_ACCOUNT
        });
      }

      const createBankUser = await BankUserModel.create({
        uid: req.user.id,
        bankProvide,
        bankNumber,
        bankName,
        bankBranch,
        status: BankUserModel.STATUS_ENUM.ACTIVE
      });
      if (!!createBankUser) {
        return res.status(200).json({
          status: true,
          data: [],
          msg: PAYMENT_MESSAGE.USER_BANK_ADDED
        });
      } else {
        return res.status(200).json({
          status: false,
          msg: PAYMENT_MESSAGE.ERROR_USER_BANK_ADDED
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(200).json({
        status: false,
        msg: ERROR_CODES.SomeErrorsOccurredPleaseTryAgain
      });
    }
  },
  getListUserBank: async (req, res) => {
    const userBankList = await BankUserModel.findAll({
      where: {
        uid: req.user.id,
        status: BankUserModel.STATUS_ENUM.ACTIVE
      },
      order: [["id", "DESC"]]
    });
    return res.status(200).json({
      status: true,
      data: userBankList,
      msg: SUCCESS
    });
  },
  createRequestWithdraw: async (req, res) => {
    try {
      const { bankName, bankNumber, bankProvide, amount, passwd } = req.body;

      if (Number(amount) < 200000) {
        return res.status(200).json({
          status: false,
          msg: Helper.replaceText(PAYMENT_MESSAGE.MINIMUN_WITHDRAWAL_AMOUNT, { "{{amount}}": "200.000" })
        });
      }

      const user = await findByID(req.user.id);

      if (user.coin < Number(amount)) {
        return res.status(200).json({
          status: false,
          msg: PAYMENT_MESSAGE.BALANCE_ENOUGHT
        });
      }

      const getUserSecrPasswd = await PasswdSecurityModel.findPasswdByUserId(req.user.id);
      if (!getUserSecrPasswd) {
        return res.status(200).json({
          status: false,
          msg: PAYMENT_MESSAGE.NOT_HAVE_SECURITY_PASSWORD
        });
      }

      if (!validatePassword(passwd, getUserSecrPasswd.password)) {
        return res.status(200).json({
          status: false,
          msg: PAYMENT_MESSAGE.PASSWORD_SECURITY_INCORRECT
        });
      }



      // let totalDeposit = 0;
      // const getTotalDeposit = await BankHistoryModel.findAll({
      //   where: {
      //     uid: req.user.id,
      //     status: BankHistoryModel.STATUS_ENUM.SUCCESS,
      //     type: BankHistoryModel.TYPE_ENUM.RECHARGE
      //   },
      //   attributes: ["amount"]
      // });
      // for (const deposit of getTotalDeposit) totalDeposit += deposit.amount;


      // if (Number(amount) > totalDeposit) {
      //   return res.status(200).json({
      //     status: false,
      //     msg: ERROR_CODES.SomeErrorsOccurredPleaseTryAgain
      //   });
      // }

      // let totalWithdraw = 0;
      // const getTotalWithdraw = await BankHistoryModel.findAll({
      //   where: {
      //     uid: req.user.id,
      //     status: BankHistoryModel.STATUS_ENUM.SUCCESS,
      //     type: BankHistoryModel.TYPE_ENUM.CASHOUT
      //   },
      //   attributes: ["amount"]
      // });
      // for (const withdraw of getTotalWithdraw) totalWithdraw += withdraw.amount;

      // if (totalWithdraw > totalDeposit) {
      //   return res.status(200).json({
      //     status: false,
      //     msg: ERROR_CODES.SomeErrorsOccurredPleaseTryAgain
      //   });
      // }

      // đièều kiện rút
      const userBetRecord = await BetHistoryModel.findAll({ where: [{ uid: req.user.id }] });
      if (!userBetRecord) return res.status(200).json({
        status: false,
        msg: PAYMENT_MESSAGE.NOT_TRANSACTION_BET_FOUND
      });

      const userConditionWithdraw = await WithdrawConditionModel.findByUserId(req.user.id);
      if (!userConditionWithdraw) return res.status(200).json({
        status: false,
        msg: ERROR_CODES.SomeErrorsOccurredPleaseTryAgain
      });

      if (userBetRecord.length < userConditionWithdraw.minimumNumbOfBet) return res.status(200).json({
        status: false,
        msg: PAYMENT_MESSAGE.NEED_TO_PLAY_ENOUGH
      });

      let totalPlay = 0;
      for (const beted of userBetRecord) totalPlay += Number(beted.validBetAmount);

      if ((totalPlay * 1000) < userConditionWithdraw.totalMinimumBetAmount) return res.status(200).json({
        status: false,
        msg: PAYMENT_MESSAGE.NEED_TO_PLAY_ENOUGH_MONEY
      });

      const botTeleConfig = JSON.parse(fs.readFileSync(process.env.PWD + "/src/configs/telegram/bot.json", "utf8"));
      const chatTeleConfig = JSON.parse(fs.readFileSync(process.env.PWD + "/src/configs/telegram/chatGroup.json", "utf8"));
      const messageTeleConfig = JSON.parse(fs.readFileSync(process.env.PWD + "/src/configs/telegram/message.json", "utf8"));

      // thông báo telegram
      if (botTeleConfig.status) {
        const time = moment().format("DD/MM/YYYY HH:MM:ss");
        const username = req.user.username;
        const name = req.user.name;
        const phone = req.user.phone;
        const email = req.user.email;
        const amount2 = Helper.numberWithCommas(Number(amount));
        const trans_id = "Đang chờ...";
        const chargeTypeProvide = "BANK";
        const chargeTypeProvideVi = "Ngân hàng";
        const chargeTypeCode = bankProvide.toUpperCase();

        teleBotSendMsg(chatTeleConfig.paymentWithdraw, messageTeleConfig.paymentWithdraw, {
          '{{time}}': time,
          '{{username}}': username,
          '{{name}}': name,
          '{{phone}}': phone,
          '{{email}}': email,
          '{{amount}}': amount2,
          '{{transId}}': trans_id,
          '{{chargeTypeProvide}}': chargeTypeProvide,
          '{{chargeTypeProvideVi}}': chargeTypeProvideVi,
          '{{chargeTypeCode}}': chargeTypeCode
        });
      }

      ///const balanceTcgRecovery = await resetBalanceToZero(user.username);
      user.coin -= Number(amount);
      //user.isPlay = UserModel.IS_PLAY_ENUM.FALSE;
      await user.save();
      await user.reload();

      const createWithdrawRequest = await BankHistoryModel.create({
        uid: req.user.id,
        bankProvide: bankProvide,
        bankNumber: bankNumber,
        bankName: bankName,
        transId: Helper.getRandomInt(10000000, 99999999),
        type: BankHistoryModel.TYPE_ENUM.CASHOUT,
        amount: Number(amount),
        info: `Withdraw ${numberWithCommas(
          Number(amount)
        )} to the bank ${bankProvide} / ${bankNumber}`,
        status: BankHistoryModel.STATUS_ENUM.PENDING
      });

      if (!!createWithdrawRequest) {
        return res.status(200).json({
          status: true,
          data: [],
          user,
          msg: PAYMENT_MESSAGE.CREATE_SUCCESS_REQUEST_WITHDRAW
        });
      } else {
        return res.status(200).json({
          status: false,
          msg: PAYMENT_MESSAGE.ERROR_CREATE_REQUEST_WITHDRAW
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(200).json({
        status: false,
        msg: ERROR_CODES.SomeErrorsOccurredPleaseTryAgain
      });
    }
  },
  transactionHistory: async (req, res) => {
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
        if (!!req.query.type) {
          match.type = req.query.type;
        }

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

        // skip PROCESSING record
        match.status = {
          [Op.ne]: BankHistoryModel.STATUS_ENUM.PROCESSING
        }

        const total = await BankHistoryModel.count({ where: match });

        const getData = await BankHistoryModel.findAll({
          where: match,
          offset: 0 + (page - 1) * kmess,
          limit: kmess,
          order: [["id", "DESC"]],
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
        msg: ERROR_CODES.SomeErrorsOccurredPleaseTryAgain,
        code: 500
      });
    }
  },
  transactionHistoryCard: async (req, res) => {
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

        // filter
        if (!!req.query.type) {
          match.type = req.query.type;
        }

        if (!!req.query.network) {
          match.network = { [Op.like]: `%${req.query.network}%` };
        }
        if (!!req.query.pin) {
          match.pin = { [Op.like]: `%${req.query.pin}%` };
        }
        if (!!req.query.seri) {
          match.seri = { [Op.like]: `%${req.query.seri}%` };
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
        const total = await CardHistoryModel.count({ where: match });

        const getData = await CardHistoryModel.findAll({
          where: match,
          offset: 0 + (page - 1) * kmess,
          limit: kmess,
          order: [["id", "DESC"]],
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
        msg: ERROR_CODES.SomeErrorsOccurredPleaseTryAgain,
        code: 500
      });
    }
  },
  getWithdrawalConditions: async (req, res) => {
    try {
      let totalDeposit = 0, totalBetValid = 0;

      const getTotalDeposit = await BankHistoryModel.findAll({
        where: {
          uid: req.user.id,
          status: BankHistoryModel.STATUS_ENUM.SUCCESS,
          type: BankHistoryModel.TYPE_ENUM.RECHARGE
        },
        attributes: ["amount"]
      });
      for (const deposit of getTotalDeposit) totalDeposit += deposit.amount;

      const getTotalBetValid = await BetHistoryModel.findAll({
        where: {
          uid: req.user.id
        },
        attributes: ["validBetAmount"]
      });
      for (const bet of getTotalBetValid) totalBetValid += bet.validBetAmount;
      totalBetValid = totalBetValid * 1000;

      return res.status(200).json({
        status: true,
        totalDeposit,
        totalBetValid,
        msg: "Success"
      });
    } catch (e) {
      console.log(e);
      res.status(200).json({
        status: false,
        msg: ERROR_CODES.SomeErrorsOccurredPleaseTryAgain,
        code: 500
      });
    }
  },
  Action: {
    getActiveAutoService: async (req, res) => {
      const getBankAvailable = await paymentAutoService.DEPOSIT.getBankAvailable();
      if (getBankAvailable.status == 1) {
        const arrBankList = [];
        getBankAvailable.data.forEach(bank => {
          arrBankList.push({
            code: bank.code,
            shortname: bank.shortName,
            name: bank.name
          });
        });
        return res.status(200).json({
          status: true,
          data: arrBankList,
          msg: SUCCESS
        });
      } else {
        return res.status(200).json({
          status: false,
          msg: "Error get auto bank list"
        });
      }
    },
    createRequestAutoBank: async (req, res) => {
      try {
        const { subType, amount } = req.body;
        if (!subType || !amount) {
          return res.json({
            status: false,
            msg: ERROR_FORM.MISSING_FIELD
          });
        }

        if (Number(amount) < 50000) {
          return res.status(200).json({
            status: false,
            msg: "Minimum deposit amount must be greater than or equal to 50,000!"
          });
        }

        const transId = Helper.getRandomInt(10000000, 99999999);
        const createRequest = await paymentAutoService.DEPOSIT.createRequestDeposit(transId, amount, subType);

        if (createRequest.status == 1) {
          const createDepositRequest = await BankHistoryModel.create({
            uid: req.user.id,
            bankProvide: subType.toUpperCase(),
            bankNumber: createRequest.data.account,
            bankName: createRequest.data.account_name,
            transId: transId,
            type: BankHistoryModel.TYPE_ENUM.RECHARGE,
            amount: Number(amount),
            info: `Auto Bank transfer to ${subType.toUpperCase()} / ${createRequest.data.account_name}`,
            status: BankHistoryModel.STATUS_ENUM.PROCESSING
          });
          if (!!createDepositRequest) {
            return res.json({
              status: true,
              data: {
                bank: createRequest.data.bank,
                bankCode: subType.toUpperCase(),
                bankName: createRequest.data.account_name,
                bankAccount: createRequest.data.account,
                content: createRequest.data.content,
                amount: Number(createRequest.data.amount),
                paymentUrl: createRequest.data.page_url
              },
              msg: SUCCESS
            });
          } else {
            return res.status(200).json({
              status: false,
              msg: "Error Create Request Deposit!"
            });
          }
        } else {
          return res.status(200).json({
            status: false,
            msg: createRequest.msg
          });
        }
      } catch (e) {
        console.log(e);
        res.status(200).json({
          status: false,
          msg: ERROR_CODES.SomeErrorsOccurredPleaseTryAgain,
          code: 500
        });
      }
    },
    createRequestAutoWallet: async (req, res) => {
      const { subType, amount } = req.body;
      if (!subType || !amount) {
        return res.json({
          status: false,
          msg: ERROR_FORM.MISSING_FIELD
        });
      }

      if (Number(amount) < 50000) {
        return res.status(200).json({
          status: false,
          msg: "Số tiền nạp tối thiểu phải lớn hơn 50.000 VND"
        });
      }

      const transId = Helper.getRandomInt(10000000, 99999999);
      const createRequest = await paymentAutoService.DEPOSIT.createRequestMomoDeposit(transId, amount);

      if (createRequest.status == 1) {
        const createDepositRequest = await BankHistoryModel.create({
          uid: req.user.id,
          bankProvide: `MOMO`,
          bankNumber: createRequest.data.phone,
          bankName: createRequest.data.name,
          transId: transId,
          type: BankHistoryModel.TYPE_ENUM.RECHARGE,
          amount: Number(amount),
          info: `Chuyển khoản đến ví Momo / ${createRequest.data.phone}`,
          status: BankHistoryModel.STATUS_ENUM.PROCESSING
        });
        if (!!createDepositRequest) {
          return res.json({
            status: true,
            data: {
              bankCode: `MOMO`,
              bankName: createRequest.data.name,
              bankAccount: createRequest.data.phone,
              content: createRequest.data.content,
              amount: Number(createRequest.data.amount),
              paymentUrl: createRequest.data.page_url,
              deepLink: createRequest.data.deep_link,
              qr: createRequest.data.qr_data
            },
            msg: SUCCESS
          });
        } else {
          return res.status(200).json({
            status: false,
            msg: "Error Create Request Deposit!"
          });
        }
      } else {
        return res.status(200).json({
          status: false,
          msg: createRequest.msg
        });
      }
    },
    getActiveAutoCardService: async (req, res) => {
      const getCardAvailable = paymentAutoService.getCardData();
      res.json(getCardAvailable);
    },
    createRequestAutoCard: async (req, res) => {
      const { network, amount, pin, seri } = req.body;
      if (!network || !amount || !pin || !seri) {
        return res.json({
          status: false,
          msg: ERROR_FORM.MISSING_FIELD
        });
      }

      if (Number(amount) < 10000) {
        return res.status(200).json({
          status: false,
          msg: "Số tiền nạp tối thiểu phải lớn hơn 10.000 VND"
        });
      }

      const mapNetwork = paymentAutoService.mapCardCode(network, true);
      if (!mapNetwork.status) {
        return res.status(200).json({
          status: false,
          msg: "Mã nhà mạng không hợp lệ!"
        });
      }

      const checkPinExist = await CardHistoryModel.findOne({ where: { pin } });
      const checkSeriExist = await CardHistoryModel.findOne({ where: { seri } });
      if (checkPinExist || checkSeriExist) {
        return res.status(200).json({
          status: false,
          msg: "Mã thẻ hoặc seri này đã tồn tại trên hệ thống!"
        });
      }

      const transId = Helper.getRandomInt(10000000, 99999999);
      const createRequest = await paymentAutoService.createRequestCard(transId, mapNetwork.code, amount, pin, seri);

      if (createRequest.status) {
        const createDepositRequest = await CardHistoryModel.create({
          uid: req.user.id,
          transId,
          type: CardHistoryModel.TYPE_ENUM.RECHARGE,
          amount: Number(amount),
          network,
          pin,
          seri,
          info: `Nạp thẻ cào ${network.toUpperCase()} / ${Helper.numberWithCommas(amount)}`,
          status: CardHistoryModel.STATUS_ENUM.PENDING
        });
        if (!!createDepositRequest) {
          return res.json(createRequest);
        } else {
          return res.status(200).json({
            status: false,
            msg: "Error Create Request Deposit!"
          });
        }
      } else {
        return res.status(200).json({
          status: false,
          msg: createRequest.msg
        });
      }
    },
    createRequestAutoUsdt: async (req, res) => {
      try {
        const { subType, amount, sender } = req.body;
        if (!subType || !amount || !sender) {
          return res.json({
            status: false,
            msg: ERROR_FORM.MISSING_FIELD
          });
        }

        if (Number(amount) < 50) {
          return res.status(200).json({
            status: false,
            msg: "Minimum deposit amount must be greater than or equal to 50$"
          });
        }

        if (sender.length < 20) {
          return res.status(200).json({
            status: false,
            msg: "Invalid sender wallet address!"
          });
        }

        const transId = Helper.getRandomInt(10000000, 99999999);
        const createRequest = await paymentAutoService.createRequestUsdt(transId, amount, subType, sender, false);

        if (createRequest.status) {
          const createDepositRequest = await BankHistoryModel.create({
            uid: req.user.id,
            bankProvide: `USDT`,
            bankNumber: createRequest.data.phoneNum,
            bankName: "",
            transId: transId,
            type: BankHistoryModel.TYPE_ENUM.RECHARGE,
            amount: Number(amount),
            info: `Transfer USDT to wallet ${createRequest.data.bank_provider.toUpperCase()} / ${createRequest.data.phoneNum}`,
            status: BankHistoryModel.STATUS_ENUM.PENDING
          });
          if (!!createDepositRequest) {
            return res.json(createRequest);
          } else {
            return res.status(200).json({
              status: false,
              msg: "Error Create Request Deposit!"
            });
          }
        } else {
          return res.status(200).json({
            status: false,
            msg: createRequest.msg
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
    createRequestUsePromotionCode: async (req, res) => {
      res.json({
        status: true,
        msg: `Mã khuyến mãi bảo trì!`
      });
    },
  }
};
