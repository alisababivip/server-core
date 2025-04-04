const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const {
  ERROR_PAGE,
  ERROR_FORM,
  ERROR_AUTH,
  ERROR_AUTH_MESSAGE,
  ERROR_MESSAGES
} = require("@Helpers/contants");
const Helper = require("@Helpers/helpers");
const { parseInt } = require("@Helpers/Number");
const { generatePassword } = require("@Helpers/password");
const {
  findByUsername,
  findByEmail,
  findByID,
  UserModel
} = require("@Models/User/User");
const { BankUserModel } = require("@Models/Bank/BankUser");
const { BankHistoryModel } = require("@Models/Bank/BankHistory");
const { BetHistoryModel } = require("@Models/Bet/BetHistory");
const { AgencyModel } = require("@Models/Agency/Agency");
const { AgencyRefModel } = require("@Models/Agency/AgencyRef");
const { WithdrawConditionModel } = require("@Models/Withdraw/WithdrawCondition");

const {
  getTotalBalance,
  resetBalanceToZero,
  backupBalanceByUser
} = require("@Services/TcgService/helpers");

module.exports = {
  listUser: async (req, res) => {
    try {
      const page = parseInt(req.query.page, true)
        ? parseInt(req.query.page, true)
        : 0;
      const kmess = parseInt(req.query.limit, true)
        ? parseInt(req.query.limit, true)
        : 0;

      if (!!page && !!kmess) {
        let match = {};
        match.role = UserModel.ROLE_ENUM.USER;

        // filter
        if (!!req.query.name) {
          match.name = { [Op.like]: `%${req.query.name}%` };
        }
        if (!!req.query.username) {
          match.username = { [Op.like]: `%${req.query.username}%` };
        }
        if (!!req.query.phone) {
          match.phone = { [Op.like]: `%${req.query.phone}%` };
        }
        if (!!req.query.email) {
          match.email = req.query.email;
        }

        const total = await UserModel.count({ where: match, distinct: false });

        const getUsers = await UserModel.findAll({
          where: match,
          offset: 0 + (page - 1) * kmess,
          limit: kmess,
          order: [["id", "DESC"]],
          attributes: { exclude: ["password", "deletedAt", "role"] },
          include: [
            {
              model: BankUserModel,
              as: "BankUser"
            },
            {
              model: WithdrawConditionModel,
              as: "WithdrawConditionInfo"
            }
          ],
          raw: true,
          nest: true
        });

        let dataExport = [];

        for (const userData of getUsers) {
          let cacheUserData = userData;
          cacheUserData.totalDeposit = 0;
          cacheUserData.totalWithdraw = 0;

          const getBankHistory = await BankHistoryModel.findAll({
            where: {
              uid: userData.id,
              status: BankHistoryModel.STATUS_ENUM.SUCCESS
            },
            attributes: ["type", "amount"]
          });

          getBankHistory.forEach((item) => {
            if (item.type == BankHistoryModel.TYPE_ENUM.RECHARGE) cacheUserData.totalDeposit += item.amount;
            if (item.type == BankHistoryModel.TYPE_ENUM.CASHOUT) cacheUserData.totalWithdraw += item.amount;
          });

          cacheUserData.Agency = {};
          const getRefAgency = await AgencyRefModel.findOne({
            where: {
              uid: userData.id
            }
          });
          if (getRefAgency) {
            const getRefAgencyInfo = await AgencyModel.findOne({
              where: {
                id: getRefAgency.agency
              }
            });
            if (getRefAgencyInfo) {
              cacheUserData.Agency.uid = getRefAgency.uid;
              cacheUserData.Agency.agency = getRefAgency.agency;
              cacheUserData.Agency.agency_code = getRefAgencyInfo.code;
            } else {
              cacheUserData.Agency.uid = getRefAgency.uid;
              cacheUserData.Agency.agency = getRefAgency.agency;
              cacheUserData.Agency.agency_code = "";
            }
          } else {
            cacheUserData.Agency.uid = "";
            cacheUserData.Agency.agency = "";
            cacheUserData.Agency.agency_code = "";
          }

          dataExport.push(cacheUserData);
        };

        res.status(200).json({
          status: true,
          data: {
            dataExport: dataExport,
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
  deleteUser: async (req, res) => {
    try {
      return res.status(200).json({
        status: false,
        msg: "Hành độn không được phép!"
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

      const user = await UserModel.findOne({ where: { id } });

      if (!!user) {
        // reset tất cả tiền tcg
        //const balanceTcgRecovery = await resetBalanceToZero(user.username);
        const balanceTcgRecovery = null;


        const deleteUser = await UserModel.destroy({
          where: { id: user.id },
          force: true
        });

        if (!!deleteUser) {
          return res.status(200).json({
            status: true,
            data: null,
            msg: "Success"
          });
        } else {
          return res.status(200).json({
            status: false,
            msg: "Err Delete User"
          });
        }
      } else {
        return res.status(200).json({
          status: false,
          msg: "User not found"
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
  userInfo: async (req, res) => {
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

      const user = await UserModel.findOne({
        where: { id, role: UserModel.ROLE_ENUM.USER },
        attributes: { exclude: ["password", "role", "deletedAt"] },
        include: [
          {
            model: BankUserModel,
            as: "BankUser",
            attributes: { exclude: ["deletedAt"] }
          },
          {
            model: WithdrawConditionModel,
            as: "WithdrawConditionInfo"
          }
        ],
        raw: true,
        nest: true
      });

      if (!!user) {
        let cacheUserData = user;
        cacheUserData.agency = null;
        const getRefAgency = await AgencyRefModel.findOne({
          where: {
            uid: user.id
          }
        });
        if (getRefAgency) {
          const getRefAgencyInfo = await AgencyModel.findOne({
            where: {
              id: getRefAgency.agency
            }
          });
          if (getRefAgencyInfo) {
            cacheUserData.agency = getRefAgencyInfo.code;
          }
        }

        return res.status(200).json({
          status: true,
          data: cacheUserData,
          msg: "success"
        });
      } else {
        return res.status(200).json({
          status: false,
          msg: "User not found"
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
  listUsername: async (req, res) => {
    try {
      let match = {};
      match.role = UserModel.ROLE_ENUM.USER;
      if (!!req.query.username) {
        match.username = { [Op.like]: `%${req.query.username}%` };
      }

      const getUsers = await UserModel.findAll({
        where: match,
        order: Sequelize.literal("rand()"),
        attributes: ["username"]
      });

      const dataExport = [];
      getUsers.forEach((user) => dataExport.push(user.username));

      res.status(200).json({
        status: true,
        data: dataExport,
        msg: "SUCCESS"
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
  getListUserBank: async (req, res) => {
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

      const user = await UserModel.findOne({ where: { id } });

      if (user) {
        const bankUser = await BankUserModel.findAll({
          where: { uid: user.id }
        });

        res.status(200).json({
          status: true,
          data: bankUser,
          msg: "SUCCESS"
        });
      } else {
        return res.status(200).json({
          status: false,
          msg: "User not found"
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
  updateBankUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { bankId, bankNumber, bankName } = req.body;

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

      const user = await UserModel.findOne({ where: { id } });
      if (user) {
        const bankUser = await BankUserModel.findOne({
          where: { uid: id, id: bankId }
        });

        if (bankUser) {
          bankUser.bankNumber = bankNumber;
          bankUser.bankName = bankName;
          await bankUser.save();
          await bankUser.reload();

          res.status(200).json({
            status: true,
            data: bankUser,
            msg: "SUCCESS"
          });
        } else {
          return res.status(200).json({
            status: false,
            msg: "Bank not found"
          });
        }
      } else {
        return res.status(200).json({
          status: false,
          msg: "User not found"
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
  deleteBankUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { bankId } = req.body;

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

      const user = await UserModel.findOne({ where: { id } });

      if (user) {
        const bankUser = await BankUserModel.findOne({
          where: { uid: id, id: bankId }
        });

        if (bankUser) {
          const deleteBankUser = await BankUserModel.destroy({
            where: { uid: id, id: bankId },
            force: true
          });

          if (!!deleteBankUser) {
            return res.status(200).json({
              status: true,
              data: null,
              msg: "Success"
            });
          } else {
            return res.status(200).json({
              status: false,
              msg: "Err Delete Bank User"
            });
          }
        } else {
          return res.status(200).json({
            status: false,
            msg: "Bank not found"
          });
        }

        res.status(200).json({
          status: true,
          data: [],
          msg: "SUCCESS"
        });
      } else {
        return res.status(200).json({
          status: false,
          msg: "User not found"
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

        const { agency, name, username, email, phone, coin, status, verify, role, withdrawCondBet, withdrawCondCoin } = req.body;

        const user = await findByID(id);
        if (!!user) {
          if (agency) {
            // check agency exit
            const getAgencyInfo = await AgencyModel.findOne({
              where: {
                code: agency
              }
            });
            if (!getAgencyInfo) return res.status(200).json({
              status: false,
              msg: "Không tìm thấy đại lý này! code 1",
              code: 400
            });

            const checkRoleAgency = await UserModel.findOne({ where: { id: getAgencyInfo.uid } });
            if (checkRoleAgency.role != UserModel.ROLE_ENUM.AGENCY) return res.status(200).json({
              status: false,
              msg: "Không tìm thấy đại lý này! code 2",
              code: 400
            });

            if (getAgencyInfo.code == user.username || getAgencyInfo.uid == user.id) return res.status(200).json({
              status: false,
              msg: "Mã đại lý phải khác với tên người dùng hiện tại!",
              code: 400
            });

            // getAgencyInfo.id

            // check ref exiteds
            const getRefAgency = await AgencyRefModel.findOne({
              where: {
                uid: user.id
              }
            });
            if (getRefAgency) {
              if (getRefAgency.agency != getAgencyInfo.id) {
                getRefAgency.agency = getAgencyInfo.id;
                await getRefAgency.save();
                await getRefAgency.reload();
              }
            } else {
              await AgencyRefModel.create({
                uid: user.id,
                agency: getAgencyInfo.id
              });
            }
          } else {
            // check ref exiteds
            const getRefAgency = await AgencyRefModel.findOne({
              where: {
                uid: user.id
              }
            });
            if (getRefAgency) {
              await AgencyRefModel.destroy({
                where: { uid: getRefAgency.uid },
                force: true
              });
            }
          }

          const userWithdrawCondition = await WithdrawConditionModel.findByUserId(user.id);
          if (!userWithdrawCondition) return res.status(200).json({
            status: false,
            msg: "Không tìm thấy điều kiện vòng cược cho người dùng này!",
            code: 400
          });
          userWithdrawCondition.minimumNumbOfBet = withdrawCondBet;
          userWithdrawCondition.totalMinimumBetAmount = withdrawCondCoin;
          await userWithdrawCondition.save();
          await userWithdrawCondition.reload();


          user.isPlay = UserModel.IS_PLAY_ENUM.FALSE;
          user.name = name;
          user.username = username;
          user.email = email;
          user.phone = phone;
          user.coin = coin;
          user.status = status;
          user.verify = verify;
          if (role == UserModel.ROLE_ENUM.USER || role == UserModel.ROLE_ENUM.AGENCY) user.role = role;
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
    },
    changePassword: async (req, res) => {
      try {
        const { id } = req.params;
        const { newPassword } = req.body;

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

        if (newPassword.length <= 5) {
          return res.status(200).json({
            status: false,
            msg: "Mật khẩu ít nhất 5 ký tự!"
          });
        }

        const user = await findByID(id);

        if (!!user) {
          user.password = generatePassword(newPassword);
          await user.save();
          await user.reload();
          res.status(200).json({
            status: true,
            msg: "Thay đổi mật khẩu thành công!",
            code: "success"
          });
        } else {
          return res.status(200).json({
            status: false,
            msg: "Không tìm thấy tài khoản!"
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
  }
};
