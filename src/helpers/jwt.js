const config = require('@Config');
const jwt = require('jsonwebtoken');

let createToken = async (userID) => {
    try {
        const token = jwt.sign({ id: userID }, config.JWT_SCRET_KEY, {
            expiresIn: config.JWT_EXPIRES_IN
        });
        return token;
    } catch (e) {
        console.log(e);
        return null;
    }
};

let verifyToken = async (token) => {
    return jwt.verify(token, config.JWT_SCRET_KEY);
}

module.exports = {
    createToken,
    verifyToken
}