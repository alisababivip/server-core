"use strict";

const assert = require('assert');
const config = require("@Config");
const mongoose = require("mongoose");
require('mongoose-long')(mongoose); // INT 64bit

const {
    MONGO_HOST,
    MONGO_PORT,
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_DATABASE,
} = config;

assert(MONGO_HOST, "MONGO_HOST configuration is required.");
assert(MONGO_PORT, "MONGO_PORT configuration is required.");
assert(MONGO_USERNAME, "MONGO_USERNAME configuration is required.");
assert(MONGO_PASSWORD, "MONGO_PASSWORD configuration is required.");
assert(MONGO_DATABASE, "MONGO_DATABASE configuration is required.");


const mongoConfig = {
    "url": `mongodb://${MONGO_HOST}:${MONGO_PORT}`,
    "options": {
        "user": `${MONGO_USERNAME}`,
        "pass": `${MONGO_PASSWORD}`,
        "dbName": `${MONGO_DATABASE}`,
        "useNewUrlParser": true,
        "useUnifiedTopology": true,
        "ssl": false,
        //'autoIndex':       false,
    },
};

const connectDatabase = () => {
    mongoose
        .connect(
            mongoConfig.url,
            mongoConfig.options
        )
        .then(() => {
            return console.log(">>>>> Mongo connected!!!");
        })
        .catch(error => {
            console.error(">>>>> Mongo Error: ", error);
            return process.exit(1);
        });
};

module.exports = connectDatabase;