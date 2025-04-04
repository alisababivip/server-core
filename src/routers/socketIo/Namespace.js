const SOCKET_EVENT = require("@Helpers/socketIoEvents");

module.exports = (socketIO) => {
    socketIO.on(SOCKET_EVENT.CONNECTION, (socket) => {
        console.log("Connected NameSpace Socket");

        socket.on(SOCKET_EVENT.MESSAGE, (msg) => {
            console.log(msg);
        });
        socket.on(SOCKET_EVENT.DISCONNECT, (data) => {
            console.log("Disconnect!");
        });

    });
}