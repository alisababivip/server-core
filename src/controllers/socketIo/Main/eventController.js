const config = require('@Config');
const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const SOCKET_EVENT = require("@Helpers/socketIoEvents");
const Helpers = require("@Helpers/helpers");
const Middware = require('@Middwares/socketIo/UserAuthenticate');
const AuthController = require('./actions/Authentication');
//const Message = require('./actions/Message');
const MessageController = {};
const { UserModel } = require("@Models/User/User");

const SocketSetup = {
    addToListOnline: (socketClient, listOnlineSocket) => {
        let isFinded = false;
        listOnlineSocket.forEach(client => {
            if (client === socketClient) {
                isFinded = true;
                // update data client online
                client = socketClient;
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
        socket.emitData = (event, data) => { try { socket.connected == 1 && socket.emit(event, JSON.stringify(data)); } catch (err) { console.log(err); } };
    },
    onAuth: async (message, socket, socketMain) => {
        if (!!message.token) {
            if (socket.auth == false) {
                // check authen
                const auth = await AuthController.AuthToken(message.token);
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

                    socket.emitData(SOCKET_EVENT.AUTHENTICATION, {
                        authorized: true,
                        user: {
                            UID: socket.UID,
                            id: socket.id,
                            role: socket.role,
                            username: socket.username,
                            name: socket.name,
                            emai: socket.email,
                            phone: socket.phone,
                            coin: socket.coin
                        },
                        message: "Authorized"
                    });
                } else {
                    socket.auth = false;
                    socket.UID = null;
                    socket.emitData(SOCKET_EVENT.AUTHENTICATION, {
                        authorized: false,
                        message: "Authentication failure"
                    });
                }
            } else {
                socket.emitData(SOCKET_EVENT.AUTHENTICATION, {
                    authorized: false,
                    message: "You are already logged in"
                });
            }
        } else {
            socket.emitData(SOCKET_EVENT.AUTHENTICATION, {
                authorized: false,
                message: "Authentication failure"
            });
        }
    },
    onMessage: async (message, socket, socketMain) => {
        // when the login is successful, pass the message data to this area
        //MessageController.onData(message, socket, socketMain);
    },
    onDisconnect: async (socket, socketMain) => {
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

    /**** handle when user send messages authentication ****/
    socketClient.on(SOCKET_EVENT.AUTHENTICATION, (message) => EventSocket.onAuth(message, socketClient, socketMain));

    /**** handle when user send messages ****/
    socketClient.on(SOCKET_EVENT.MESSAGE, (message) => EventSocket.onMessage(message, socketClient, socketMain));

    /**** handle when user close socket connect ****/
    socketClient.on(SOCKET_EVENT.DISCONNECT, () => EventSocket.onDisconnect(socketClient, socketMain));

    /***
     * OTHER EVENTS
     */

    /**** handle test event ****/
    // socketClient.on(SOCKET_EVENT.TEST, () => {
    //     if (!Middware(socketClient)) return;
    //     //EventSocket.onDisconnect(socketClient, socketMain);
    //     console.log("Actived");
    // });

}