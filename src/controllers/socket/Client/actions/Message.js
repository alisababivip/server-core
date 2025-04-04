const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Ho_Chi_Minh");

module.exports = {
    onData: (data, socket, socketMain) => {
        if (!!data.ping) {
            console.log(`Pong!!!`);
        }
    }
}
