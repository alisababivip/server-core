const entryRouterPath = `/entry`;
const EntryController = require('@EntryControllers/RechargeController');

module.exports = (app, io) => {
    app.get(`${entryRouterPath}/callback/rechargeBank`, (req, res) => {
        EntryController.RechargeBank(req, res, io);
    });
    app.get(`${entryRouterPath}/callback/rechargeWallet`, (req, res) => {
        EntryController.RechargeWallet(req, res, io);
    });
    app.get(`${entryRouterPath}/callback/rechargeCard`, (req, res) => {
        EntryController.RechargeCard(req, res, io);
    });
};