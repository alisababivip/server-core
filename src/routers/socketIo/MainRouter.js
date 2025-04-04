const SOCKET_EVENT = require("@Helpers/socketIoEvents");

module.exports = (socketIO) => {
    socketIO.on(SOCKET_EVENT.CONNECTION, (socketClient) => {
        console.log("Connected Main Socket");
        require("@SocketIoControllers/Main/eventController")(socketClient, socketIO);
    });
}