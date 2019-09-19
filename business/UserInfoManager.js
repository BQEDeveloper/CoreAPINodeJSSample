var AuthResponseModel = require(__dirname + "/../models/AuthResponseModel.js");
var HttpHeaderModel = require(__dirname + "/../models/HttpHeaderModel.js");
var HttpResponseModel = require(__dirname + "/../models/HttpResponseModel.js");
var UserInfoModel = require(__dirname + "/../models/UserInfoModel.js");
var APIHelper = require(__dirname + "/../shared/APIHelper.js");
var GeneralMethods = require(__dirname + "/../shared/GeneralMethods.js");
var AuthManager = require(__dirname + "/AuthManager.js");
const Result = require(__dirname + "/../shared/Result.js");

class UserInfoManager {


    constructor() {
        try {
            this.config = GeneralMethods.GetConfig();

            this.authResponse = new AuthResponseModel();
            this.authManager = new AuthManager();                    
            
            if(this.authManager.GetAuthResponse()){
                this.authResponse = this.authManager.GetAuthResponse();  
                this.httpResponse = new HttpResponseModel();
                this.httpHeader = new HttpHeaderModel();              
                this.httpHeader.authorization = "Bearer " + this.authResponse.access_token;
            }            
        } catch (error) {
            throw new Error(error)
        }        
    }

    GetUserInfo(callback) {
        try {
            this.userInfo = new UserInfoModel();
            APIHelper.Get(this.config.CoreIdentityBaseUrl + '/connect/userinfo', this.httpHeader, function(response){
                this.httpResponse = response;
                if(this.httpResponse.header_code == 401) { //UnAuthorised
                    this.authManager.ReAuthorize(function(status, response){
                        if(status == Result.Success && response) {
                            this.authResponse = response;
                            this.httpHeader.authorization = "Bearer " + this.authResponse.access_token;
                            this.GetUserInfo(callback);
                        } else //Error
                            callback(Result.Error, response)
                    }.bind(this));
                } else if(this.httpResponse.header_code == 200) { // Success
                    this.userInfo = JSON.parse(this.httpResponse.body)
                    callback(Result.Success, this.userInfo);             
                } else
                    callback(Result.Error, this.userInfo);
            }.bind(this));     
            
        } catch (error) {
            throw new Error(error)
        }        
    }

   
}
module.exports = UserInfoManager;