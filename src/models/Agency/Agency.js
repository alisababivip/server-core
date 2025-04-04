const sequelize = require("@Databases/mysql");
const { Model, DataTypes } = require("sequelize");


class AgencyModel extends Model {
    static STATUS_ENUM = {
        ACTIVE: "active",
        PENDING: "pending",
        BLOCKED: "blocked"
    };
}

const defineParams = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uid: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    code: { type: DataTypes.STRING, allowNull: false },
    status: {
        type: DataTypes.ENUM({ values: Object.values(AgencyModel.STATUS_ENUM) }),
        defaultValue: AgencyModel.STATUS_ENUM.ACTIVE
    },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
    deletedAt: { type: DataTypes.DATE }
};

AgencyModel.init(defineParams, {
    paranoid: true,
    indexes: [{ unique: true, fields: ["uid", "code"] }],
    tableName: "agencies",
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    deletedAt: "deletedAt",
    sequelize
});

const findByRefCode = async (code) => {
    const user = await AgencyModel.findOne({
        where: { code },
    });
    if (user == null) {
        return null;
    } else {
        return user;
    }
};

const findByID = async (id) => {
    const user = await AgencyModel.findOne({
        where: { id }
    });
    if (user == null) {
        return null;
    } else {
        return user;
    }
};

module.exports = {
    findByRefCode,
    findByID,
    AgencyModel
};
