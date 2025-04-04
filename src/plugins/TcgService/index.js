/*
 * Module TCGAMING API
 * DESCRIPTION: tương tác với các api của TCGAMING
 * DOCUMENT: https://doc.tc-gaming.com/
 * AUTHOR: Kunkeyr - Vu Duy Luc
 * GITHUB: https://github.com/kunkey
 */

const axios = require('axios');
const qs = require("qs");
const crypto = require('crypto');
const sha256 = require('js-sha256');

let TcgConfigStorage = require("@Configs/game/tcgStorage.json");

class TcgService {
  constructor(config) {
    this.TcgApiConfig = config; // init tcg config
    this.RequestTimeOut = 10; // request wait response maximum 10 secounds
  }
  // CREATE/REGISTER PLAYER API
  async createUser(username, password) {
    return await this.postAPI({
      username,
      password,
      currency: this.TcgApiConfig.currency,
      method: "cm"
    });
  }
  // UPDATE PASSWORD API
  async updatePassword(username, password) {
    return await this.postAPI({
      username,
      password,
      currency: this.TcgApiConfig.currency,
      method: "up"
    });
  }
  // GET BALANCE API
  async getBalance(username, product_type) {
    return await this.postAPI({
      username,
      product_type,
      method: "gb"
    });
  }
  // USER FUND TRANSFER API
  async userTransfer(username, product_type, fund_type, amount, reference_no) {
    return await this.postAPI({
      username,
      product_type,
      fund_type,
      amount,
      reference_no,
      method: "ft"
    });
  }
  // RESET USER BALANCE TO ZERO AND RETURN THE POINTS TO THE PROVIDER
  async userFullTransfer(username, product_type, reference_no) {
    return await this.postAPI({
      username,
      product_type,
      reference_no,
      method: "ftoa"
    });
  }
  // CHECK TRANSACTION STATUS API
  async checkTransfer(product_type, ref_no) {
    return await this.postAPI({
      product_type,
      ref_no,
      method: "cs"
    });
  }
  // LAUNCH GAME API
  async getLaunchGame(username, product_type, game_mode, game_code, platform) {
    return await this.postAPI({
      username,
      product_type,
      game_mode,
      game_code,
      platform,
      language: this.TcgApiConfig.language,
      method: "lg"
    });
  }
  // LAUNCH GAME LOTTERY API => CLOSED
  async getLaunchGameLottery(username, product_type, game_mode, game_code, platform, view) {
    let lotteryBetMode = "Traditional";
    let series = [];
    return await this.postAPI({
      username,
      product_type,
      game_mode,
      game_code,
      platform,
      language: this.TcgApiConfig.language,
      method: "lg"
    });
  }
  // GAME LIST API
  async getGameList(product_type, platform, client_type, game_type) {
    try {
      const gameListData = await this.postAPI({
        product_type,
        platform,
        client_type,
        game_type,
        page: 1,
        page_size: 1000,
        method: "tgl"
      });

      if (gameListData.status == 0) {
        if (gameListData.games !== null) {
          const listData = [];
          gameListData.games.forEach((item) => {
            let gameItem = item;
            gameItem.icon = `${TcgConfigStorage.url}/${gameItem.productCode}/${gameItem.tcgGameCode}.png`;
            listData.push(gameItem);
          });
          return {
            status: 0,
            games: listData,
            error_desc: null
          }
        } else {
          return {
            status: 1,
            games: [],
            error_desc: null
          }
        }
      } else {
        return gameListData;
      }
    } catch (e) {
      console.log(e);
      return {
        status: 1,
        games: [],
        error_desc: e.message
      }
    }
  }
  // PLAYER GAME RANK API
  async getGameRank(product_type, game_category, game_code, start_date, end_date, count) {
    return await this.postAPI({
      product_type,
      game_category,
      game_code,
      start_date,
      end_date,
      count,
      method: "pgr"
    });
  }
  // GET RNG BET DETAILS
  async getBetDetails(batch_name, page) {
    return await this.postAPI({
      batch_name,
      page,
      method: "bd"
    });
  }
  // GET RNG BET DETAILS BY MEMBER
  async getBetDetailsMember(username, start_date, end_date, page) {
    return await this.postAPI({
      username,
      start_date,
      end_date,
      page,
      method: "bdm"
    });
  }
  // post data to tcgaming
  async postAPI(dataParams) {
    try {
      const hashData = await this.hashParams(dataParams);
      const post = await axios({
        method: "post",
        url: this.TcgApiConfig.url,
        timeout: 1000 * this.RequestTimeOut,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: qs.stringify({
          merchant_code: this.TcgApiConfig.merchantCode,
          params: hashData.params,
          sign: hashData.sign
        })
      });
      return post.data;
    } catch (e) {
      console.log(`TCG MerchantCode "${this.TcgApiConfig.merchantCode}" => Error Post API: ${e.message}`);
      return;
    }
  }
  // create sign hash string
  async hashParams(params) {
    var cipher = crypto.createCipheriv('des-ecb', this.TcgApiConfig.desKey, null);
    var padded = this.pkcs5Pad(JSON.stringify(params), 8);
    var encryptedParams = cipher.update(padded, null, 'base64');
    encryptedParams += cipher.final('base64');
    return {
      params: encryptedParams,
      sign: sha256(encryptedParams + this.TcgApiConfig.signKey)
    }
  }

  pkcs5Pad(text, blocksize) {
    const pad = blocksize - (text.length % blocksize);
    return text + String.fromCharCode(pad).repeat(pad);
  }
}

module.exports = TcgService;