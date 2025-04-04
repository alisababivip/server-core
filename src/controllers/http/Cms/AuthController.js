const {
  ERROR_PAGE,
  ERROR_FORM,
  ERROR_AUTH,
  ERROR_AUTH_MESSAGE,
  ERROR_MESSAGES
} = require("@Helpers/contants");
const { createToken, verifyToken } = require("@Helpers/jwt");
const { generatePassword, validatePassword } = require("@Helpers/password");
const { validateEmail } = require("@Helpers/email");
const { randomString } = require("@Helpers/String");
const validator = require("validator");
const { UserModel, findByUsername, findByEmail } = require("@Models/User/User");

module.exports = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password)
        return res.status(200).json({
          status: false,
          msg: ERROR_FORM.MISSING_FIELD
        });

      const user = await findByUsername(username);

      if (!user) {
        res.status(200).json({
          status: false,
          msg: ERROR_AUTH.LOGIN_FAIL
        });
        return;
      }

      if (validatePassword(password, user.password)) {
        if (user.role !== UserModel.ROLE_ENUM.ADMIN) {
          res.status(200).json({
            status: false,
            msg: ERROR_AUTH.LOGIN_FAIL,
            code: 6
          });
          return;
        }

        const userDocument = user.toJSON();
        delete userDocument.password;

        res.status(200).json({
          status: true,
          msg: "success",
          data: userDocument,
          access_token: await createToken(userDocument.id),
          code: 200
        });
      } else {
        res.status(200).json({
          status: false,
          msg: ERROR_AUTH.LOGIN_FAIL,
          code: 1
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
  me: async (req, res) => {
    try {
      const userDocument = req.user.toJSON();
      delete userDocument.password;

      res.status(200).json({
        status: true,
        msg: "success",
        user: userDocument,
        access_token: req.token,
        code: 200
      });
    } catch (e) {
      res.status(200).json({
        status: false,
        msg: e.message,
        code: 500
      });
    }
  },
  changePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = await findByUsername(req.user.username);

      if (!!user && user.role == UserModel.ROLE_ENUM.ADMIN) {
        if (validatePassword(oldPassword, user.password)) {
          user.password = generatePassword(newPassword);
          await user.save();
          await user.reload();
          res.status(200).json({
            status: true,
            msg: "success",
            code: "success"
          });
        } else {
          res.status(200).json({
            status: false,
            msg: "Mật khẩu cũ không đúng",
            code: "err_old_password"
          });
        }
      } else {
        res.status(200).json({
          status: false,
          msg: `Không tìm thấy tài khoản`,
          code: 500
        });
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({
        status: false,
        msg: e.message,
        code: 500
      });
    }
  }
};
