const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const AuthController = require('./actions/Authentication');
const Message = require('./actions/Message');
const { UserModel } = require("@Models/User/User");

const SocketSetup = {
    addToListOnline: (socketClient, listOnlineSocket) => {
        let isFinded = false;
        listOnlineSocket.forEach(client => {
            if (client === socketClient) {
                isFinded = true;
                client = socket;
                return;
            }
        });
        if (!isFinded) listOnlineSocket.push(socketClient);
    },
    removeFromListOnline: (socketClient, listOnlineSocket) => {
        listOnlineSocket.splice(listOnlineSocket.indexOf(socketClient), 1);
    }
}

const EventSocket = {
    initSocketParameter: (socket) => {
        socket.auth = false;
        socket.UID = null;
        socket.lastConnectTime = moment();
        socket.red = (data) => { try { socket.readyState == 1 && socket.send(JSON.stringify(data)); } catch (err) { } };
    },
    onMessage: async (message, socket, socketMain) => {
        try {
            if (!!message) {
                message = JSON.parse(message);
                if (socket.auth == false && !!message.authentication) {
                    // check authen
                    const auth = await AuthController.AuthToken(message.authentication);

                    if (!!auth.status) {
                        socket.auth = true;
                        socket.UID = auth.user.id;
                        socket.id = auth.user.id;
                        socket.role = auth.user.role;
                        socket.code = auth.user.code;
                        socket.username = auth.user.username;
                        socket.name = auth.user.name;
                        socket.email = auth.user.email;
                        socket.phone = auth.user.phone;
                        socket.coin = auth.user.coin;
                        socket.lastConnectTime = moment();

                        if (auth.user.role == UserModel.ROLE_ENUM.USER || auth.user.role == UserModel.ROLE_ENUM.AGENCY) {
                            SocketSetup.addToListOnline(socket, socketMain.users);
                        }

                        socket.red({
                            Authorized: true,
                            user: {
                                UID: socket.UID,
                                id: socket.id,
                                role: socket.role,
                                username: socket.username,
                                name: socket.name,
                                emai: socket.email,
                                phone: socket.phone,
                                coin: socket.coin
                            }
                        });
                    } else {
                        socket.auth = false;
                        socket.UID = null;
                        socket.red({ unauth: { message: 'Authentication failure' } });
                    }
                } else if (!!socket.auth) {
                    // khi login success thì truyền data tin nhắn vào khu này
                    Message.onData(message, socket, socketMain);
                }
            }
        } catch (error) {
            console.log(error);
        }
    },
    onClose: async (data, socket, socketMain) => {
        socket.auth = false;

        if (socket.UID !== null) {
            SocketSetup.removeFromListOnline(socket, socketMain.users);
            if (socket) delete socket;
        }
    }
}

module.exports = (socketClient, socketMain) => {
    /**** create all custom function to user and main socket ****/
    EventSocket.initSocketParameter(socketClient);

    /**** handle when user send messages ****/
    socketClient.on("message", (message) => EventSocket.onMessage(message, socketClient, socketMain));

    /**** handle when user close socket connect ****/
    socketClient.on("close", (message) => EventSocket.onClose(message, socketClient, socketMain));
}
