const DashboardController = require("./DashBoard");

module.exports = (data, socket, socketMain) => {
    if (!!data.dashboard) {
        DashboardController(data.dashboard, socket, socketMain);
    }
}