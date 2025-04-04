const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const ActionController = require("../Actions");

module.exports = {
    onData: (data, socket, socketMain) => {
        if (!!data.ping) {
            console.log(`Pong!!!`);
        }
        if (!!data.action) {
            ActionController(data.action, socket, socketMain);
        }
    }
}
