const axios = require("axios");
const md5 = require("md5");
const helper = require("./helpers");
const config = require("@Configs/payment/comchoGateBank.json");

module.exports = {
    // Kiểm tra tình trạng bảo trì hệ thống
    getMaintanceStatus: async function () {
        return new Promise((resolve, reject) => {
            axios.request({
                method: 'get',
                maxBodyLength: Infinity,
                url: `${config.apiUrl}/api/payment-api/res/get-mainternance-status`,
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
    // Kiểm tra biểu phí dịch vụ
    getCurrentDiscountRate: async function () {
        return new Promise((resolve, reject) => {
            axios.request({
                method: 'get',
                maxBodyLength: Infinity,
                url: `${config.apiUrl}/api/payment-api/res/get-discount-rate?apiKey=${config.apiKey}`,
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
    // Lấy danh sách ngân hàng hỗ trợ
    getBankSupportList: async function () {
        return new Promise((resolve, reject) => {
            axios.request({
                method: 'get',
                maxBodyLength: Infinity,
                url: `${config.apiUrl}/api/payment-api/res/get-bank-support-list`,
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
    /*** NẠP TIỀN ***/
    DEPOSIT: {
        // lấy danh sách ngân hàng hỗ trợ có sẵn
        getBankAvailable: async function () {
            return new Promise((resolve, reject) => {
                axios.request({
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: `${config.apiUrl}/api/payment-api/deposit/bank/get-active-bank-list?apiKey=${config.apiKey}`,
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
        // tạo yêu cầu nạp tiền 
        createRequestDeposit: async function (requestId, amount, bankCode) {
            return new Promise((resolve, reject) => {
                axios.request({
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: `${config.apiUrl}/api/payment-api/deposit/bank/create-request?apiKey=${config.apiKey}&amount=${amount}&requestId=${requestId}&bankCode=${bankCode.toUpperCase()}`,
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
        }
    },
    /***** Tạo Yêu Cầu Rút Tiền ****/
    WITHDRAW: {
        // tạo yêu cầu rút tiền 
        createRequestWithdraw: async function (requestId, amount, bankCode, bankAccount, bankName, message = '') {
            const signature = md5(bankCode + amount + requestId + config.scretKey); // Mã signature xác minh giao dịch, công thức = md5(bankCode + amount + requestId + scretKey)

            return new Promise((resolve, reject) => {
                axios.request({
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: `${config.apiUrl}/api/payment-api/withdraw/bank/create-request?apiKey=${config.apiKey}&amount=${amount}&requestId=${requestId}&bankCode=${bankCode.toUpperCase()}&bankAccount=${bankAccount}&bankName=${helper.nonAccentVietnamese(bankName).toUpperCase()}&message=${helper.nonAccentVietnamese(message)}&signature=${signature}`,
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
        }
    }
};