const md5 = require('md5');

const generatePassword = (password) => {
    return md5(password);
}
const validatePassword = (password, hashedPass) => {
    return (md5(password) === hashedPass);
};
const randomPassword = (length) => {
    var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

module.exports = {
    generatePassword,
    validatePassword,
    randomPassword
}