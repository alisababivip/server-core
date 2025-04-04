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
const {
  findByUsername,
  findByEmail,
  findByID,
  UserModel
} = require("@Models/User/User");
const { BankUserModel } = require("@Models/Bank/BankUser");
const { AgencyRefModel } = require("@Models/Agency/AgencyRef");
const gameConfig = require("@Configs/game/gameConfig.json");

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
        let assocScopes = [];

        // add condition agency = curent agency id
        match.agency = req.agency.id;
        // filter
        if (!!req.query.name) {
          assocScopes.push({ method: ['bySearchName', req.query.name] });
        }
        if (!!req.query.username) {
          assocScopes.push({ method: ['bySearchUsername', req.query.username] });
        }
        if (!!req.query.phone) {
          assocScopes.push({ method: ['bySearchPhone', req.query.phone] });
        }
        if (!!req.query.email) {
          assocScopes.push({ method: ['bySearchEmail', req.query.email] });
        }

        assocScopes.push({ method: ['withUserInfo'] }, { method: ['withRoleUser'] });

        const total = await AgencyRefModel.count({ where: match, distinct: false });

        let getUsers = await AgencyRefModel.scope(assocScopes).findAll({
          where: match,
          offset: 0 + (page - 1) * kmess,
          limit: kmess,
          order: [["id", "DESC"]],
          attributes: { exclude: ["uid", "agency", "deletedAt"] },
          distinct: false
        });

        for (const user of getUsers) user.setDataValue('userBank', await BankUserModel.findAll({ where: { uid: user.userInfo.id }, attributes: { exclude: ["deletedAt", "updatedAt", "uid", "id"] } }));

        res.status(200).json({
          status: true,
          data: {
            dataExport: getUsers,
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

      const user = await UserModel.findOne({ where: { id } });

      if (!!user) {
        // reset tất cả tiền tcg
        // const balanceTcgRecovery = await resetBalanceToZero(user.username);
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
          }
        ]
      });

      if (!!user) {
        return res.status(200).json({
          status: true,
          data: user,
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

        const { name, username, email, phone, coin, status, verify, role } = req.body;

        const user = await findByID(id);
        if (!!user) {
          user.isPlay = UserModel.IS_PLAY_ENUM.FALSE;
          user.name = name;
          user.username = username;
          user.email = email;
          user.phone = phone;
          user.coin = coin;
          user.status = status;
          user.verify = verify;
          if (role == UserModel.ROLE_ENUM.USER || role == UserModel.ROLE_ENUM.AGENCY) user.role = role;

          user.save();
          user.reload();
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
