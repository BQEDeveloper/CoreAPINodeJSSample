var express = require('express');
var app = express();
var session = require('express-session');
var cons = require('consolidate');
var bodyParser = require("body-parser");


var JWTModel = require(__dirname + "/models/JWTModel.js");
var ActivityModel = require(__dirname + "/models/ActivityModel.js");
var AuthResponse = require(__dirname + "/models/AuthResponseModel.js");
var GeneralMethods = require(__dirname + "/shared/GeneralMethods.js");
var AuthManager = require(__dirname + "/business/AuthManager.js");
var ActivityManager = require(__dirname + "/business/ActivityManager.js");
var UserInfoManager = require(__dirname + "/business/UserInfoManager.js");
var JWTManager = require(__dirname + "/business/JWTManager.js");
const Result = require(__dirname + "/shared/Result.js");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({secret: GeneralMethods.GenerateRandomString() }));


app.set('views', __dirname + '/views');
app.engine('html', cons.swig);
app.set('view engine', 'html');

app.get('/', function (req, res) {
    try {  
        this.authManager = new AuthManager();
        this.authResponse = new AuthResponse();    
        this.jwt = new JWTModel();

        this.config = GeneralMethods.GetConfig();

        if(req.query.code != null) { //Authenticate (Code Exchange)
            //verfiy that the state parameter returned by the server is the same that was sent earlier.
            if(this.authManager.IsValidState(req, res, req.query.state)){
                this.authManager.Authorize(req.query.code,function(status, response){
                    if(status == Result.Success && response) {
                        this.authResponse = response;
                        this.jWTManager = new JWTManager(this.config, this.authResponse.id_token);
                        //Decode id_token (JWT)
                        jwt = this.jWTManager.DecodeJWT();
                        //Validate the Decoded Token
                        this.jWTManager.ValidateJWT(jwt,function(response){
                            if(response){
                                //Save Auth Response
                                this.authManager.SaveAuthResponse(this.authResponse);
                                //Load Activity List  
                                this.activityManager = new ActivityManager();              
                                this.activityManager.GetList(function(status, response){
                                    if(status == Result.Success && response) {
                                        let activityList = response;
                                        //Get User Info
                                        this.userInfoManager = new UserInfoManager();
                                        this.userInfoManager.GetUserInfo(function(status, response){
                                            if(status == Result.Success && response) {
                                                let userInfo = response
                                                res.render('ActivityListView', { activityList: activityList, userInfo: userInfo } );
                                            } else //Error
                                                res.write("<div style='color:red'>" + response.body + "</div>")                                            
                                        }.bind(this));
                                    }
                                    else //Error
                                        res.write("<div style='color:red'>" + response.body + "</div>")                                                        
                                }.bind(this));
                            } else
                            res.write("<div style='color:red'>Invalid JWT.</div>")                        
                        }.bind(this))
                    } else //Error
                        res.write("<div style='color:red'>" + response.body + "</div>")                                                                                                                         
                }.bind(this));            
            } else
                throw new Error("State Parameter returned doesn't match to the one sent to Core API Server.");
        } else if(this.authManager.GetAuthResponse()){ // Load Activity List
            //Load Activity List  
            this.activityManager = new ActivityManager();              
            this.activityManager.GetList(function(status, response){
                if(status == Result.Success && response){
                    let activityList = response;
                    //Get User Info
                    this.userInfoManager = new UserInfoManager();
                    this.userInfoManager.GetUserInfo(function(status, response){
                        if(status == Result.Success && response) {
                            let userInfo = response
                            res.render('ActivityListView', { activityList: activityList, userInfo: userInfo } );
                        } else //Error
                            res.write("<div style='color:red'>" + response.body + "</div>")
                    }.bind(this));
                } else //Error
                    res.write("<div style='color:red'>" + response.body + "</div>")             
            }.bind(this));
        } else { // Load index.html
            res.sendFile(__dirname +'/index.html');
        }
    } catch (error) {
        res.write("<div style='color:red'>" + error + "</div>")
    }
});

app.post('/ConnectToCore', function (req, res) {
    try {
        this.authManager.ConnectToCore(req, res);
    } catch (error) {        
        res.write("<div style='color:red'>" + error + "</div>")
    }    
});

app.post('/DisconnectFromCore', function (req, res) {
    try {
        this.authManager.DisconnectFromCore(function(status, response){
            if (status == Result.Success && response)
                res.redirect('/');
            else // Error
                res.write("<div style='color:red'>" + response.body + "</div>")
        });
    } catch (error) {        
        res.write("<div style='color:red'>" + error + "</div>")
    }    
});

app.get('/DeleteActivityView', function (req, res) {
    try {
        if(req.query.id){
            this.activityManager = new ActivityManager(); 
            this.activityManager.Delete(req.query.id, function(status, response){
                if (status == Result.Success && response)
                    res.redirect('/');
                else // Error
                    res.write("<div style='color:red'>" + response.body + "</div>")
            });
        }        
    } catch (error) {        
        res.write("<div style='color:red'>" + error + "</div>")
    }    
});

app.get('/CreateActivityView', function (req, res) {
    try {
        if(req.query.id){ //load Activity
            this.activityManager = new ActivityManager(); 
            this.activityManager.Get(req.query.id, function(status, response){
                if(status == Result.Success && response) {
                    let activity = response;
                    if(activity.billable)
                        activity.billable = 'checked';
                    res.render('CreateActivityView', { activity: activity } );
                } else // Error
                    res.write("<div style='color:red'>" + response.body + "</div>")                
            });
        } else // New Activity
            res.render('CreateActivityView');
    } catch (error) {        
        res.write("<div style='color:red'>" + error + "</div>")
    }    
})

app.post('/SubmitActivity', function (req, res) {
    try {
        var activity = new ActivityModel();
        this.activityManager = new ActivityManager();
        
        activity.code = req.body.code;
        activity.description = req.body.description;
        activity.billRate = req.body.billRate;
        activity.costRate = req.body.costRate;
        if(req.body.isBillable)
            activity.billable = true;
        if(req.body.id) { // Update
            activity.id = req.body.id;
            this.activityManager.Update(activity.id, activity, function(status, response){
                if(status == Result.Success && response)
                    res.redirect('/');
                else // Error
                    res.write("<div style='color:red'>" + response.body + "</div>")
            });
        } else { // Create
            this.activityManager.Create(activity, function(status, response){
                if(status == Result.Success && response)
                    res.redirect('/');
                else // Error
                    res.write("<div style='color:red'>" + response.body + "</div>")
            });
        }
    } catch (error) {        
        res.write("<div style='color:red'>" + error + "</div>")
    }        
});

var server = app.listen(8081, function () {
    console.log('Node server is running..');
});