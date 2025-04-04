require("dotenv").config();
const config = require("@Config");
const path = require("path");
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const app = express();
const expressWs = require("express-ws")(app);
const bodyParser = require("body-parser");
const morgan = require("morgan");
const compression = require("compression");

// Cors Origin
app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));
// đọc dữ liệu from
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// sử dụng để log mọi request ra console
app.use(morgan("[:date[iso]][:method :url HTTP/:http-version] Completed with status :status in :response-time ms"));
// specify the view engine is ejs
app.set("view engine", "ejs");
// specify the view folder is view
app.set("views", "./views");
// Serve static html, js, css, and image files from the 'public' directory
app.use(express.static(path.join(__dirname, "../public")));
// show request log
app.use(compression());
// express set session options
app.use(session({ resave: true, saveUninitialized: true, secret: config.SESSION_SECRET }));

// Initialize main socket
const socketInit = expressWs.getWss();

// Initialize original objects, function...  when the application runs
require("@Loaders")(socketInit, null);

// Initialize services running in the background
require("@Services")(socketInit);

// Initialize the plugins to run when application runs
require("@Plugins")(socketInit);

// Initialize test sections
require("@Utils")(socketInit);

// Initialize the routers rest api
app.use("/api", require("@HttpRouters"));

// Initialize the routers WebSocket
require("@SocketRouters")(app, socketInit);

// Initialize the routers EntryPoint (Callback)
require("@EntryRouters")(app, socketInit);

const server = app.listen(config.PORT, () => {
  console.log(
    ">>> Express server is running at port %d in %s mode!",
    config.PORT,
    config.ENV_ENVIROMENT
  );
  console.log(">>> Press CTRL-C to stop server\n");
});

// Export server handle
module.exports = server;