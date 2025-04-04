require("dotenv").config();
const config = require("@Config");
var socketIO;

try {
    socketIO = require('socket.io')(config.PORT_SOCKET_IO, {
        // options for socketIO
        cors: {
            origin: '*',
        }
    });
    if (socketIO != null) {
        console.log(
            `>>> SocketIO server is running at port %d in %s mode!`,
            config.PORT_SOCKET_IO,
            config.ENV_ENVIROMENT
        );
        // Initialize original objects, function...  when the application runs
        require("@Loaders")(null, socketIO);
        require("@SocketIoRouters")(socketIO);
    } else {
        throw new Error("Failed to init SocketIO server!", error);
    }
} catch (error) {
    throw new Error(error);
}

module.exports = socketIO;