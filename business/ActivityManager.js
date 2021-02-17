var AuthResponseModel = require(__dirname + "/../models/AuthResponseModel.js");
var HttpHeaderModel = require(__dirname + "/../models/HttpHeaderModel.js");
var HttpResponseModel = require(__dirname + "/../models/HttpResponseModel.js");
var ActivityModel = require(__dirname + "/../models/ActivityModel.js");
var APIHelper = require(__dirname + "/../shared/APIHelper.js");
var AuthManager = require(__dirname + "/AuthManager.js");
const Result = require(__dirname + "/../shared/Result.js");

class ActivityManager {


    constructor() {
        try {

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
            APIHelper.Get(this.authResponse.endpoint + '/activity?page=0,1000&orderby=name', this.httpHeader, function(response){
                this.httpResponse = response;
                if(this.httpResponse.header_code == 401) { //UnAuthorised
                    this.authManager.ReAuthorize(function(status, response){
                        if(status == Result.Success && response) {
                            this.authResponse = response;
                            this.httpHeader.authorization = "Bearer " + this.authResponse.access_token;
                            this.GetList(callback);
                        } else //Error
                            callback(Result.Error, response)
                    }.bind(this));
                } else if(this.httpResponse.header_code == 200) { // Success
                    this.activityList = JSON.parse(this.httpResponse.body)
                    callback(Result.Success, this.activityList);             
                } else
                    callback(Result.Error, this.httpResponse);
            }.bind(this));     
            
        } catch (error) {
            throw new Error(error)
        }        
    }

    Get(id, callback) {
        try {
            this.activity = new ActivityModel();
            APIHelper.Get(this.authResponse.endpoint + '/activity/' + id, this.httpHeader, function(response){
                this.httpResponse = response;
                if(this.httpResponse.header_code == 401) { //UnAuthorised
                    this.authManager.ReAuthorize(function(status, response){
                        if(status == Result.Success && response) {
                            this.authResponse = response;
                            this.httpHeader.authorization = "Bearer " + this.authResponse.access_token;
                            this.Get(id, callback);
                        } else //Error
                            callback(Result.Error, response)
                    }.bind(this));
                } else if(this.httpResponse.header_code == 200) { // Success
                    this.activity = JSON.parse(this.httpResponse.body)
                    callback(Result.Success, this.activity);             
                } else
                    callback(Result.Error, this.httpResponse);
            }.bind(this));     
            
        } catch (error) {
            throw new Error(error)
        }        
    }

    Create(activity, callback) {
        try {            
            APIHelper.Post(this.authResponse.endpoint + '/activity', JSON.stringify(activity), this.httpHeader, function(response){
                this.httpResponse = response;
                if(this.httpResponse.header_code == 401) { //UnAuthorised
                    this.authManager.ReAuthorize(function(status, response){
                        if(status == Result.Success && response) {
                            this.authResponse = response;
                            this.httpHeader.authorization = "Bearer " + this.authResponse.access_token;
                            this.Create(activity, callback);
                        } else //Error
                            callback(Result.Error, response)
                    }.bind(this));
                } else if(this.httpResponse.header_code == 200 || this.httpResponse.header_code == 201) { // Success or Created
                    callback(Result.Success, this.httpResponse);             
                } else
                    callback(Result.Error, this.httpResponse);
            }.bind(this));     
            
        } catch (error) {
            throw new Error(error)
        }        
    }

    Update(id, activity, callback) {
        try {
            APIHelper.Put(this.authResponse.endpoint + '/activity/' + id, JSON.stringify(activity), this.httpHeader, function(response){
                this.httpResponse = response;
                if(this.httpResponse.header_code == 401) { //UnAuthorised
                    this.authManager.ReAuthorize(function(status, response){
                        if(status == Result.Success && response) {
                            this.authResponse = response;
                            this.httpHeader.authorization = "Bearer " + this.authResponse.access_token;
                            this.Update(id, activity, callback);
                        } else //Error
                            callback(Result.Error, response)
                    }.bind(this));
                } else if(this.httpResponse.header_code == 200) { // Success
                    this.activity = JSON.parse(this.httpResponse.body)
                    callback(Result.Success, this.activity);             
                } else
                    callback(Result.Error, this.httpResponse);
            }.bind(this));     
            
        } catch (error) {
            throw new Error(error)
        }        
    }

    Delete(id, callback) {
        try {
            APIHelper.Delete(this.authResponse.endpoint + '/activity/' + id, this.httpHeader, function(response){
                this.httpResponse = response;
                if(this.httpResponse.header_code == 401) { //UnAuthorised
                    this.authManager.ReAuthorize(function(status, response){
                        if(status == Result.Success && response) {
                            this.authResponse = response;
                            this.httpHeader.authorization = "Bearer " + this.authResponse.access_token;
                            this.Delete(id, callback);
                        } else //Error
                            callback(Result.Error, response)
                    }.bind(this));
                } else if(this.httpResponse.header_code == 200 || this.httpResponse.header_code == 204) { // Success or No-Content                    
                    callback(Result.Success, this.httpResponse);             
                } else
                    callback(Result.Error, this.httpResponse);
            }.bind(this));     
            
        } catch (error) {
            throw new Error(error);
        }        
    }

   
}
module.exports = ActivityManager;