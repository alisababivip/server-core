const InitDatabaseConnection = require("@Models");

InitDatabaseConnection
    .then(() => console.log(">>> Connected MySql Database!"))
    .catch((err) => console.error(">>> Connect MySql Database Error: ", err));

module.exports = InitDatabaseConnection;