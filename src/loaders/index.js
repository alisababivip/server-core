const initTaskProcessStorage = require("./services/initTaskProcessStorage");
const initSocketFunctions = require("./socket/initSocketFunctions");
const initSocketIoFunctions = require("./socketIo/initSocketIoFunctions");

module.exports = async (socketInit = null, socketIoInit = null) => {
    // websocket
    if (socketInit != null) {
        initTaskProcessStorage();
        initSocketFunctions(socketInit);
    }
    // socketIo
    if (socketIoInit != null) {
        initSocketIoFunctions(socketIoInit);
    }
};
