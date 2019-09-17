var AuthResponseModel = require(__dirname + "/../models/AuthResponseModel.js");
var HttpHeaderModel = require(__dirname + "/../models/HttpHeaderModel.js");
var HttpResponseModel = require(__dirname + "/../models/HttpResponseModel.js");
var ActivityModel = require(__dirname + "/../models/ActivityModel.js");
var APIHelper = require(__dirname + "/../shared/APIHelper.js");
var GeneralMethods = require(__dirname + "/../shared/GeneralMethods.js");
var AuthManager = require(__dirname + "/AuthManager.js");

class ActivityManager {


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

    GetList(callback) {
        try {
            this.activityList = [];
            APIHelper.Get(this.config.CoreAPIBaseUrl + '/activity?page=0,100&orderby=name', this.httpHeader, function(response){
                this.httpResponse = response;
                if(this.httpResponse.header_code == 401) { //UnAuthorised
                    this.authManager.ReAuthorize(function(response){
                        if(response) {
                            this.authResponse = response;
                            this.httpHeader.authorization = "Bearer " + this.authResponse.access_token;
                            this.GetList(callback);
                        }
                    }.bind(this));
                } else if(this.httpResponse.header_code == 200) { // Success
                    this.activityList = JSON.parse(this.httpResponse.body)
                    callback(this.activityList);             
                } else
                    throw new Error(this.httpResponse);
            }.bind(this));     
            
        } catch (error) {
            throw new Error(error)
        }        
    }

    Get(id, callback) {
        try {
            this.activity = new ActivityModel();
            APIHelper.Get(this.config.CoreAPIBaseUrl + '/activity/' + id, this.httpHeader, function(response){
                this.httpResponse = response;
                if(this.httpResponse.header_code == 401) { //UnAuthorised
                    this.authManager.ReAuthorize(function(response){
                        if(response) {
                            this.authResponse = response;
                            this.httpHeader.authorization = "Bearer " + this.authResponse.access_token;
                            this.Get(id, callback);
                        }
                    }.bind(this));
                } else if(this.httpResponse.header_code == 200) { // Success
                    this.activity = JSON.parse(this.httpResponse.body)
                    callback(this.activity);             
                } else
                    throw new Error(this.httpResponse);
            }.bind(this));     
            
        } catch (error) {
            throw new Error(error)
        }        
    }

    Create(activity, callback) {
        try {            
            APIHelper.Post(this.config.CoreAPIBaseUrl + '/activity', JSON.stringify(activity), this.httpHeader, function(response){
                this.httpResponse = response;
                if(this.httpResponse.header_code == 401) { //UnAuthorised
                    this.authManager.ReAuthorize(function(response){
                        if(response) {
                            this.authResponse = response;
                            this.httpHeader.authorization = "Bearer " + this.authResponse.access_token;
                            this.Create(activity, callback);
                        }
                    }.bind(this));
                } else if(this.httpResponse.header_code == 200 || this.httpResponse.header_code == 201) { // Success or Created
                    callback(this.httpResponse);             
                } else
                    throw new Error(this.httpResponse);
            }.bind(this));     
            
        } catch (error) {
            throw new Error(error)
        }        
    }

    Update(id, activity, callback) {
        try {
            APIHelper.Put(this.config.CoreAPIBaseUrl + '/activity/' + id, JSON.stringify(activity), this.httpHeader, function(response){
                this.httpResponse = response;
                if(this.httpResponse.header_code == 401) { //UnAuthorised
                    this.authManager.ReAuthorize(function(response){
                        if(response) {
                            this.authResponse = response;
                            this.httpHeader.authorization = "Bearer " + this.authResponse.access_token;
                            this.Update(id, activity, callback);
                        }
                    }.bind(this));
                } else if(this.httpResponse.header_code == 200) { // Success
                    this.activity = JSON.parse(this.httpResponse.body)
                    callback(this.activity);             
                } else
                    throw new Error(this.httpResponse);
            }.bind(this));     
            
        } catch (error) {
            throw new Error(error)
        }        
    }

    Delete(id, callback) {
        try {
            APIHelper.Delete(this.config.CoreAPIBaseUrl + '/activity/' + id, this.httpHeader, function(response){
                this.httpResponse = response;
                if(this.httpResponse.header_code == 401) { //UnAuthorised
                    this.authManager.ReAuthorize(function(response){
                        if(response) {
                            this.authResponse = response;
                            this.httpHeader.authorization = "Bearer " + this.authResponse.access_token;
                            this.Delete(id, callback);
                        }
                    }.bind(this));
                } else if(this.httpResponse.header_code == 200 || this.httpResponse.header_code == 204) { // Success or No-Content                    
                    callback(this.httpResponse);             
                } else
                    throw new Error(this.httpResponse);
            }.bind(this));     
            
        } catch (error) {
            throw new Error(error);
        }        
    }

   
}
module.exports = ActivityManager;