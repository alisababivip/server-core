const SOCKET_EVENT = require("@Helpers/socketIoEvents");

module.exports = (socketClient) => {
    if (!socketClient.auth) {
        socketClient.emitData(SOCKET_EVENT.NO_ACCESS, {
            status: false,
            message: "Not authorized to access this resource"
        });
        return false;
    } else {
        return true;
    }
}