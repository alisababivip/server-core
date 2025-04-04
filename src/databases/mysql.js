"use strict";

const assert = require("assert");
const Sequelize = require("sequelize");
const config = require("@Config");

const {
  ENV_ENVIROMENT,
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_USERNAME,
  MYSQL_PASSWORD,
  MYSQL_DATABASE
} = config;

assert(MYSQL_HOST, "MYSQL_HOST configuration is required.");
assert(MYSQL_PORT, "MYSQL_PORT configuration is required.");
assert(MYSQL_USERNAME, "MYSQL_USERNAME configuration is required.");
assert(MYSQL_PASSWORD, "MYSQL_PASSWORD configuration is required.");
assert(MYSQL_DATABASE, "MYSQL_DATABASE configuration is required.");


const connection = new Sequelize(
  MYSQL_DATABASE,
  MYSQL_USERNAME,
  MYSQL_PASSWORD,
  {
    host: MYSQL_HOST,
    port: parseInt(MYSQL_PORT),
    dialect: "mysql",
    dialectOptions: {
      connectTimeout: 30000
    },
    pool: {
      max: 100,
      min: 1,
      acquire: 30000,
      idle: 3600000
    },
    timezone: "+07:00",
    logging: (str) => (ENV_ENVIROMENT == "develop") ? console.log(str) : null,
    //logging: () => { },
    define: {
      charset: "utf8",
      collate: "utf8_general_ci",
      timestamps: true
    }
  }
);

module.exports = connection;
