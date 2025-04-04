const { ERROR_AUTH, SUCCESS } = require('@Helpers/contants');
const { verifyToken } = require('@Helpers/jwt');
const { UserModel, findByUsername, findByEmail, findByID } = require("@Models/User/User");

module.exports = {
    AuthToken: async (data) => {
        try {
            if (!!data.token) {
                const payload = await verifyToken(data.token);

                if (payload) {
                    const user = await findByID(payload.id);
                    if (!!user) {
                        const userDocument = user.toJSON();
                        delete userDocument.password;

                        return {
                            status: true,
                            user: userDocument,
                            msg: SUCCESS,
                            code: '200'
                        }
                    } else {
                        return {
                            status: false,
                            msg: ERROR_AUTH.TOKEN_INVALID,
                            code: 'err_get_user'
                        }
                    }
                } else {
                    return {
                        status: false,
                        msg: ERROR_AUTH.TOKEN_INVALID,
                        code: 'err_payload'
                    }
                }
            }
        } catch (e) {
            console.log(e);
            return {
                status: false,
                msg: ERROR_AUTH.TOKEN_INVALID,
                code: 500
            }
        }
    }
}
