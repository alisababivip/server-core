const { UserModel } = require("@Models/User/User");


module.exports = async (io) => {
    io.agents = []; // danh sách đại lý tổng đang đăng nhập
    io.users = []; // danh sách người dùng đang đăng nhập
    io.admins = []; // danh sách quản trị viên đang đăng nhập

    // Phát sóng tới tất cả client đang online không phân biệt role nào
    io.sendAll = function (data) {
        this.clients.forEach(function (client) {
            if (client.red) {
                client.red(data);
            }
        });
    };

    // Phát sóng tới tất cả các client connect nhưng chưa đăng nhập
    io.sendAllClient = function (data) {
        this.clients.forEach(function (client) {
            if (client.red && client.auth === false) {
                client.red(data);
            }
        });
    };

    // Phát sóng tới một người dùng đã đăng nhập
    io.sendToUser = function (UID, data) {
        this.clients.forEach((client) => {
            if (client.role == UserModel.ROLE_ENUM.USER && client.red && client.auth === true && client.UID == UID) {
                client.red(data);
            }
        });
    }

    // Phát sóng tới tất cả người dùng đã đăng nhập
    io.sendAllUser = function (data, noBroadcast = null) {
        this.clients.forEach(function (client) {
            if (client.role == UserModel.ROLE_ENUM.USER && client.red && client.auth === true && noBroadcast !== client) {
                client.red(data);
            }
        });
    };

    // Phát sóng tới tất cả agency
    io.sendAllAgent = function (data, noBroadcast = null) {
        this.clients.forEach(function (client) {
            if (client.role == UserModel.ROLE_ENUM.AGENCY && client.red && client.auth === true && noBroadcast !== client) {
                client.red(data);
            }
        });
    };

    // global varible socket
    global.webSocket = io;
}