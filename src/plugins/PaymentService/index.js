/*
 * Module Payment Mopay
 * DESCRIPTION: tương tác với các api payment của Mopay
 * DOCUMENT: Mopay/doc/
 * AUTHOR: Kunkeyr - Vu Duy Luc
 * GITHUB: https://github.com/kunkey
 */

const axios = require('axios');
const qs = require("qs");
const md5 = require('md5');
const config = require('@Configs/payment/autoGateBank.json');
const configCard = require('@Configs/payment/autoGateCard.json');
const configUsdt = require('@Configs/payment/autoGateUsdt.json');
const BankWithdraw = require("@Configs/payment/BankWithdraw.json");

const ENUM_MESSAGE = {
    SUCCESS_001: "success",
    ERROR_001: "there is a problem with the connection network's third-party system",
    ERROR_002: "The system is maintenance",
    ERROR_003: "third party data cannot be obtained",
    ERROR_004: "this bank not supports"
}

const objectToQueryString = (obj) => {
    return Object.entries(obj).reduce((acc, [key, val]) => {
        if (Array.isArray(val)) {
            val.forEach(e => acc += (acc ? "&" : "") + key + "=" + e);
        } else {
            acc += (acc ? "&" : "") + key + "=" + val;
        }
        return acc;
    }, "");
}

// lấy danh sách bank code
const getListBankCode = async () => {
    try {
        const createReq = await axios({
            method: 'get',
            url: `${config.entryPoint}/api/Bank/getBankAvailable?apiKey=${config.apikey}`,
            headers: {
                'accept': 'application/json'
            }
        });

        if (!createReq) return {
            status: false,
            msg: ENUM_MESSAGE.ERROR_003
        };

        const resp = createReq.data;
        if (resp.stt !== 1) {
            return {
                status: false,
                msg: resp.msg
            }
        } else {
            return {
                status: true,
                msg: ENUM_MESSAGE.SUCCESS_001,
                data: resp.data
            }
        }
    } catch (e) {
        console.log(e);
        return {
            status: false,
            msg: e.message
        };
    }
}

// tạo yêu cầu nạp bank/momo
const createRequest = async (transId, type, amount, subType, callback = false) => {
    try {
        let queryString = {};
        queryString.apiKey = config.apikey;
        queryString.chargeType = type;
        queryString.amount = Number(amount);
        queryString.requestId = transId;
        queryString.subType = subType;
        queryString.sign = md5(`${queryString.amount}${queryString.chargeType}${queryString.requestId}${config.signkey}`);
        //if (callback) queryString.callback = config.callback_url;

        const createReq = await axios({
            method: 'get',
            url: `${config.entryPoint}/api/MM/RegCharge?${objectToQueryString(queryString)}`,
            headers: {
                'accept': 'application/json'
            }
        });
        if (!createReq) return {
            status: false,
            msg: ENUM_MESSAGE.ERROR_003
        };

        const resp = createReq.data;
        if (resp.stt !== 1) {
            return {
                status: false,
                msg: resp.msg
            }
        } else {
            return {
                status: true,
                msg: ENUM_MESSAGE.SUCCESS_001,
                data: resp.data
            }
        }
    } catch (e) {
        console.log(e);
        return {
            status: false,
            msg: e.message
        };
    }
}

// tạo yêu cầu rút bank
const createRequestWithdrawBank = async (transId, bank_code, bank_account, bank_accountName, amount, msg) => {
    try {
        if (!await checkExistBankCode(bank_code)) return {
            status: false,
            msg: ENUM_MESSAGE.ERROR_004
        };

        let queryString = {};
        queryString.apiKey = config.apikey;
        queryString.bank_code = bank_code;
        queryString.bank_account = bank_account;
        queryString.bank_accountName = bank_accountName;
        queryString.amount = Number(amount);
        queryString.requestId = transId;
        queryString.signature = md5(`${queryString.bank_account}${queryString.amount}${queryString.requestId}${config.loginPw}`);
        queryString.msg = msg;

        const createReq = await axios({
            method: 'get',
            url: `${config.entryPoint}/api/Bank/ChargeOut?${objectToQueryString(queryString)}`,
            headers: {
                'accept': 'application/json'
            }
        });

        if (!createReq) return {
            status: false,
            msg: ENUM_MESSAGE.ERROR_003
        };

        const resp = createReq.data;

        if (resp.stt !== 1) {
            return {
                status: false,
                msg: resp.msg
            }
        } else {
            return {
                status: true,
                msg: ENUM_MESSAGE.SUCCESS_001,
                data: resp.data
            }
        }
    } catch (e) {
        console.log(e);
        return {
            status: false,
            msg: e.message
        };
    }
}

// tạo yêu cầu rút momo
const createRequestWithdrawMomo = async (transId, account, account_name, amount, msg) => {
    try {
        let queryString = {};
        queryString.apiKey = config.apikey;
        queryString.account = account;
        queryString.account_name = account_name;
        queryString.amount = Number(amount);
        queryString.requestId = transId;
        queryString.signature = md5(`${queryString.account}${queryString.amount}${queryString.requestId}${config.loginPw}`);
        queryString.msg = msg;

        const createReq = await axios({
            method: 'get',
            url: `${config.entryPoint}/api/MM/ChargeOut?${objectToQueryString(queryString)}`,
            headers: {
                'accept': 'application/json'
            }
        });
        if (!createReq) return {
            status: false,
            msg: ENUM_MESSAGE.ERROR_003
        };

        const resp = createReq.data;
        if (resp.stt !== 1) {
            return {
                status: false,
                msg: resp.msg
            }
        } else {
            return {
                status: true,
                msg: ENUM_MESSAGE.SUCCESS_001,
                data: resp.data
            }
        }
    } catch (e) {
        console.log(e);
        return {
            status: false,
            msg: e.message
        };
    }
}

// mapping card code 
const mapCardCode = (cardCode, reverseType = true) => {
    cardObj = {
        'VIETTEL': 'vt',
        'MOBIFONE': 'mb',
        'VINAPHONE': 'vn'
    };

    let codeReturn = null;

    if (reverseType) {
        for (var key in cardObj) {
            if (cardObj.hasOwnProperty(key)) {
                if (cardCode === key) {
                    codeReturn = cardObj[key];
                    break;
                }
            }
        }
        return {
            status: (!codeReturn) ? false : true,
            code: codeReturn,
            msg: ENUM_MESSAGE.SUCCESS_001
        }
    } else {
        for (var key in cardObj) {
            if (cardObj.hasOwnProperty(key)) {
                if (cardCode === cardObj[key]) {
                    codeReturn = key;
                    break;
                }
            }
        }
        return {
            status: (!codeReturn) ? false : true,
            code: codeReturn,
            msg: ENUM_MESSAGE.SUCCESS_001
        }
    }
}

// lấy danh sách cardcode
const getCardData = () => {
    return {
        status: true,
        data: {
            cardCode: [
                "VIETTEL",
                "VINAPHONE",
                "MOBIFONE"
            ],
            amountValue: [
                10000,
                20000,
                30000,
                50000,
                100000,
                200000,
                300000,
                500000,
                10000000
            ]
        },
        msg: ENUM_MESSAGE.SUCCESS_001
    }
}

// tạo yêu cầu nạp thẻ
const createRequestCard = async (transId, network, amount, pin, seri) => {
    try {
        let queryString = {};
        queryString.apiKey = configCard.apikey;
        queryString.type = network;
        queryString.menhGia = Number(amount);
        queryString.requestId = transId;
        queryString.code = pin;
        queryString.serial = seri;

        const createReq = await axios({
            method: 'get',
            url: `${config.entryPoint}/api?c=RegChargeCard&${objectToQueryString(queryString)}`,
            headers: {
                'accept': 'application/json'
            }
        });
        if (!createReq) return {
            status: false,
            msg: ENUM_MESSAGE.ERROR_003
        };

        const resp = createReq.data;
        if (resp.stt !== 1) {
            return {
                status: false,
                msg: resp.msg
            }
        } else {
            return {
                status: true,
                msg: ENUM_MESSAGE.SUCCESS_001,
                data: resp.data
            }
        }
    } catch (e) {
        console.log(e);
        return {
            status: false,
            msg: e.message
        };
    }
}

const checkExistBankCode = async (bankCode) => {
    let isFound = false;
    for (var bank of BankWithdraw) {
        if (bank.code == bankCode) {
            isFound = true;
            break;
        } else {
            continue;
        }
    }
    return isFound;
}

// tạo yêu cầu nạp usdt
const createRequestUsdt = async (transId, amount, subType, sender, callback = false) => {
    try {
        let queryString = {};
        queryString.apiKey = configUsdt.apikey;
        queryString.chargeType = "usdt";
        queryString.amount = Number(amount);
        queryString.requestId = transId;
        queryString.subType = subType;
        queryString.phoneSender = sender;
        if (callback) queryString.callback = configUsdt.callback_url;

        const createReq = await axios({
            method: 'get',
            url: `${configUsdt.entryPoint}/api/MM/RegCharge?${objectToQueryString(queryString)}`,
            headers: {
                'accept': 'application/json'
            }
        });
        if (!createReq) return {
            status: false,
            msg: ENUM_MESSAGE.ERROR_003
        };

        const resp = createReq.data;
        if (resp.stt !== 1) {
            return {
                status: false,
                msg: resp.msg
            }
        } else {
            return {
                status: true,
                msg: ENUM_MESSAGE.SUCCESS_001,
                data: resp.data
            }
        }
    } catch (e) {
        console.log(e);
        return {
            status: false,
            msg: e.message
        };
    }
}

module.exports = {
    getListBankCode,
    createRequest,
    createRequestWithdrawBank,
    createRequestWithdrawMomo,
    mapCardCode,
    getCardData,
    createRequestCard,
    createRequestUsdt
}