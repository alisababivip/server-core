const sequelize = require("@Databases/mysql");
const { Model, DataTypes } = require("sequelize");

class ConfigModel extends Model {
    static KEY_ENUM = {
        SITE_INFOMATION: "site_infomation",
        TELEGRAM_BOT: "telegram_bot",
        TELEGRAM_CHAT_GROUP: "telegram_chat_group",
        TELEGRAM_MESSAGE: "telegram_message"
    };
}

const defineParams = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    key: { type: DataTypes.STRING, allowNull: false },
    value: {
        type: DataTypes.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue("value"));
        },
        set: function (value) {
            return this.setDataValue("value", JSON.stringify(value));
        },
        allowNull: false,
        defaultValue: "{}"
    },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
    deletedAt: { type: DataTypes.DATE }
};

ConfigModel.init(defineParams, {
    paranoid: true,
    tableName: "configs",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    deletedAt: "deletedAt",
    sequelize
});

const getConfigFromDB = async (key) => {
    try {
        return await ConfigModel.findOne({ where: { key } });
    } catch (e) {
        console.log(e);
    }
}

const setConfigFromDB = async (key, value) => {
    try {
        if (await ConfigModel.count({ where: { key } }) != 0) {
            // update config 
            const updateRecord = await ConfigModel.update({ value }, { where: { key } });
            return (!!updateRecord) ? true : false;
        } else {
            // create config 
            const createRecord = await ConfigModel.create({ key, value });
            return (!!createRecord) ? true : false;
        }
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

module.exports = {
    ConfigModel,
    getConfigFromDB,
    setConfigFromDB
};
