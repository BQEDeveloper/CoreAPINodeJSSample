var ConfigModel = require(__dirname + "/../models/ConfigModel.js");
const fs = require('fs');
const ini = require('ini');

class GeneralMethods {

    static GetConfig() {
        try {
            const config = new ConfigModel();
            const configObj = ini.parse(fs.readFileSync(__dirname + '/../config.ini', 'utf-8'));
            config.CoreIdentityBaseUrl = configObj.urls.CoreIdentityBaseUrl;
            config.Secret = configObj.DeveloperAppConfig.Secret;
            config.ClientID = configObj.DeveloperAppConfig.ClientID;
            config.RedirectURI = configObj.DeveloperAppConfig.RedirectURI;
            config.Scopes = configObj.Scopes.Scopes;
            return config;
            
        } catch (error) {
            throw new Error(error)
        }        
    }

    static GenerateRandomString(length = 20) {
        try {
            const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+":?><';
            var randomString = '';
            for (var i = 0; i < length; i++) {
                randomString += characters[Math.floor(Math.random() * (characters.length - 1)) + 0];
            }
            return randomString;            
        } catch (error) {
            throw new Error(error)
        }
    }

    static Base64UrlDecode(base64Url) {
        try {
            return Buffer.from(base64Url, 'base64').toString();
        } catch (error) {
            throw new Error(error);
        }
    }
}
module.exports = GeneralMethods;