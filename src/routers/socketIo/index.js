const SOCKET_EVENT = require("@Helpers/socketIoEvents");

module.exports = (socketIO) => {
    // main path
    require("@SocketIoRouters/MainRouter")(socketIO);
    // example custom namespace path
    require("@SocketIoRouters/Namespace")(socketIO.of('/custom-namespace'));
}