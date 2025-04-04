const { UserModel } = require("@Models/User/User");
const TcgConfig = require("@Configs/game/tcgGaming.json");
const TcgService = require("@Plugins/TcgService");
const clientConfig = require("@Configs/game/clientConfig.json");


module.exports = async () => {
    const getAllUser = await UserModel.findAll();
    console.log(getAllUser.length);
    let i = 0;
    for (const user of getAllUser) {
        i++;
        console.log("User Counter: " + i);
        try {
            // Create Account Tcgaming
            for (const ApiKey in TcgConfig) {
                const tcgService = new TcgService(TcgConfig[ApiKey]);
                const create = await tcgService.createUser(
                    user.username,
                    clientConfig.default_password
                );
                console.log("Create User: " + user.username);
                console.log(create);
                console.log("===========");
            }
        } catch (e) {
            console.log(e);
        }
    }

    console.log("TCG Backup Account Done!!!");
}