const axios = require("axios");
const md5 = require("md5");
const FormData = require('form-data');
const helper = require("./helpers");
const config = require("@Configs/payment/ongchuaGateBank.json");

module.exports = {
    /*** NẠP TIỀN ***/
    DEPOSIT: {
        // lấy danh sách ngân hàng hỗ trợ có sẵn
        getBankAvailable: async function () {
            return new Promise((resolve, reject) => {
                axios.request({
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: `${config.apiUrl}/api/bi/list?partner=${config.partnerId}`,
                    headers: {}
                })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        console.log(error);
                        reject(error);
                    });
            });
        },
        // tạo yêu cầu nạp tiền bank
        createRequestDeposit: async function (requestId, amount, bankCode) {
            return new Promise((resolve, reject) => {
                axios.request({
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: `${config.apiUrl}/api/bi/info?partner=${config.partnerId}&uid=${requestId}&amount=${amount}&bank_code=${bankCode.toUpperCase()}&type=ctt`,
                    headers: {}
                })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        console.log(error);
                        reject(error);
                    });
            });
        },
        // tạo yêu cầu nạp tiền momo
        createRequestMomoDeposit: async function (requestId, amount) {
            return new Promise((resolve, reject) => {
                axios.request({
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: `${config.apiUrl}/api/mmi/info?partner=${config.partnerId}&uid=${requestId}&amount=${amount}`,
                    headers: {}
                })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        console.log(error);
                        reject(error);
                    });
            });
        },
    },
    /***** Tạo Yêu Cầu Rút Tiền ****/
    WITHDRAW: {
        // tạo yêu cầu rút tiền 
        createRequestWithdrawBank: async function (requestId, amount, bankCode, bankAccount, bankName) {
            const signature = md5(requestId + bankAccount + amount + config.partnerKey); // Mã signature xác minh giao dịch, công thức = md5(bankCode + amount + requestId + scretKey)
            return new Promise((resolve, reject) => {
                let data = new FormData();
                data.append('partner', config.partnerId);
                data.append('user_id', requestId);
                data.append('bank_code', bankCode);
                data.append('bank_account', bankAccount);
                data.append('bank_fullname', bankName);
                data.append('amount', amount);
                data.append('request_id', requestId);
                data.append('callback_url', config.callbackUrl.withdraw);
                data.append('signature', signature);

                axios.request({
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: `${config.apiUrl}/api/bank/register`,
                    headers: {
                        ...data.getHeaders()
                    },
                    data: data
                })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        console.log(error);
                        reject(error);
                    });
            });
        },
        createRequestWithdrawMomo: async function (requestId, amount, bankAccount) {
            const signature = md5(requestId + bankAccount + amount + config.partnerKey); // Mã signature xác minh giao dịch, công thức = md5(bankCode + amount + requestId + scretKey)
            return new Promise((resolve, reject) => {
                let data = new FormData();
                data.append('partner', config.partnerId);
                data.append('user_id', requestId);
                data.append('account', bankAccount);
                data.append('amount', amount);
                data.append('request_id', requestId);
                data.append('callback_url', config.callbackUrl.withdraw);
                data.append('signature', signature);

                axios.request({
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: `${config.apiUrl}/api/mmo/register`,
                    headers: {
                        ...data.getHeaders()
                    },
                    data: data
                })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        console.log(error);
                        reject(error);
                    });
            });
        }
    }
};