const { UserModel } = require("@Models/User/User");


module.exports = async (socketIo) => {
    socketIo.users = []; // danh sách người dùng đang đăng nhập
    socketIo.admins = []; // danh sách quản trị viên đang đăng nhập

    // global varible socket
    global.socketIO = socketIo;
}