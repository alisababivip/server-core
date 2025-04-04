// const AgentEventController = require('@SocketControllers/Agent/eventController');
const CmsEventController = require('@SocketControllers/Cms/eventController');
const ClientEventController = require('@SocketControllers/Client/eventController');

// Router Websocket
module.exports = (app, io) => {
    app.ws('/socket/connect', (ws, req) => {
        // AgentMasterEventController(ws, io);
        ClientEventController(ws, io);
    });
    app.ws('/socket/agent', (ws, req) => {
        // AgentEventController(ws, io);
    });
    app.ws('/socket/cms', (ws, req) => {
        CmsEventController(ws, io);
    });
};
