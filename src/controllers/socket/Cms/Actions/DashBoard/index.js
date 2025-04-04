


const ActionController = {
    getOnline: (socket, socketMain) => {
        let dataExport = {};
        // user 
        dataExport.users = {};
        dataExport.users.online = socketMain.users.length;
        dataExport.users.list = [];

        //console.log(socketMain.users);

        socketMain.users.forEach(client => {
            dataExport.users.list.push({
                username: client.username,
                name: client.name,
                uid: client.UID,
                coin: client.coin
            });
        });

        // agents 
        dataExport.agents = {};
        dataExport.agents.online = socketMain.agents.length;
        dataExport.agents.list = [];

        socketMain.agents.forEach(client => {
            dataExport.agents.list.push({
                username: client.username,
                name: client.name,
                uid: client.UID,
                coin: client.coin
            });
        });

        // admins 
        dataExport.admins = {};
        dataExport.admins.online = socketMain.admins.length;
        dataExport.admins.list = [];

        socketMain.admins.forEach(client => {
            dataExport.admins.list.push({
                username: client.username,
                name: client.name,
                uid: client.UID,
                coin: client.coin
            });
        });

        socket.red({
            action: {
                dashboard: {
                    online: dataExport
                }
            }
        });
    }
}


module.exports = (data, socket, socketMain) => {
    if (!!data.getOnline) {
        ActionController.getOnline(socket, socketMain);
    }
}