var AuthResponseModel = require(__dirname + "/../models/AuthResponseModel.js");
var HttpHeaderModel = require(__dirname + "/../models/HttpHeaderModel.js");
var HttpResponseModel = require(__dirname + "/../models/HttpResponseModel.js");
var APIHelper = require(__dirname + "/../shared/APIHelper.js");
var GeneralMethods = require(__dirname + "/../shared/GeneralMethods.js");
const Result = require(__dirname + "/../shared/Result.js");

const fs = require('fs')

class AuthManager {


    constructor() {
        this.config = GeneralMethods.GetConfig();

        this.authResponse = new AuthResponseModel();
        this.httpResponse = new HttpResponseModel();
        this.httpHeader = new HttpHeaderModel();
        
        if(this.GetAuthResponse())
            this.authResponse = this.GetAuthResponse();
    }

    ConnectToCore(req, res) {
        try {
            let state = encodeURIComponent(GeneralMethods.GenerateRandomString());
            req.session.state = state;   
            res.writeHead(301, 
                { Location: this.config.CoreIdentityBaseUrl + '/connect/authorize?client_id=' + this.config.ClientID + '&response_type=code&scope=' + this.config.Scopes + '&redirect_uri=' + this.config.RedirectURI + '&state=' + state }
            );
            res.end();         
            
        } catch (error) {
            throw new Error(error)
        }        
    }

    DisconnectFromCore(callback) {
        try {
            this.httpHeader.contentType = "application/x-www-form-urlencoded";   

            let data = 'token=' + this.authResponse.access_token + '&client_id=' + this.config.ClientID + '&client_secret=' + this.config.Secret;

            APIHelper.Post(this.config.CoreIdentityBaseUrl + '/connect/revocation', data, this.httpHeader, function(response){
                this.httpResponse = response;
                if(this.httpResponse.header_code == 200) {
                    this.SaveAuthResponse(null);
                    callback(Result.Success, this.httpResponse);                   
                } else
                    callback(Result.Error, this.httpResponse);
            }.bind(this));                                
        } catch (error) {
            throw new Error(error)
        }        
    }

    Authorize(code, callback) {
        try {
            this.httpHeader.contentType = "application/x-www-form-urlencoded"; 

            let data = 'code=' + code + '&redirect_uri=' + this.config.RedirectURI + '&grant_type=authorization_code' + '&client_id=' + this.config.ClientID + '&client_secret=' + this.config.Secret;

            APIHelper.Post(this.config.CoreIdentityBaseUrl + '/connect/token', data, this.httpHeader, function(response){
                this.httpResponse = response;
                if(this.httpResponse.header_code == 200) {
                    this.authResponse = JSON.parse(this.httpResponse.body)
                    callback(Result.Success, this.authResponse);             
                }      
                else
                    callback(Result.Error, this.httpResponse);
            }.bind(this));                               
        } catch (error) {
            throw new Error(error)
        }        
    }

    ReAuthorize(callback) {
        try {
            if(this.GetAuthResponse() != null) {
                let auth = this.GetAuthResponse();

                this.httpHeader.contentType = 'application/x-www-form-urlencoded';

                let data = 'refresh_token=' + auth.refresh_token + '&grant_type=refresh_token' + '&client_id=' + this.config.ClientID + '&client_secret=' + this.config.Secret;

                APIHelper.Post(this.config.CoreIdentityBaseUrl + '/connect/token', data, this.httpHeader, function(response){
                    this.httpResponse = response;
                    if(this.httpResponse.header_code == 200) {
                        this.authResponse = JSON.parse(this.httpResponse.body)
                        this.SaveAuthResponse(this.authResponse);
                        callback(Result.Success, this.authResponse);             
                    }      
                    else
                        callback(Result.Error, this.httpResponse);
                }.bind(this));
            }                                                        
        } catch (error) {
            throw new Error(error)
        }        
    }

    IsValidState(req, res, state) {
        try {
            return encodeURIComponent(state) == req.session.state;                      
        } catch (error) {
            throw new Error(error)
        }        
    }

    SaveAuthResponse(authResponse) {
        try {
            if(authResponse.endpoint.endsWith('/'))
                authResponse.endpoint = authResponse.endpoint.slice(0, -1);
            fs.writeFileSync(__dirname + '/../AuthResponse.ini', JSON.stringify(authResponse) , 'utf-8');                       
        } catch (error) {
            throw new Error(error)
        }
    }

    GetAuthResponse() {
        try {
            this.authResponse = fs.readFileSync(__dirname + '/../AuthResponse.ini', 'utf8');
            if (this.authResponse)
                this.authResponse = JSON.parse(this.authResponse);
            return this.authResponse;                      
        } catch (error) {
            throw new Error(error)
        }
    }

}
module.exports = AuthManager;