var AuthResponseModel = require(__dirname + "/../models/AuthResponseModel.js");
var HttpHeaderModel = require(__dirname + "/../models/HttpHeaderModel.js");
var HttpResponseModel = require(__dirname + "/../models/HttpResponseModel.js");
var JWTModel = require(__dirname + "/../models/JWTModel.js");
var JWKSModel = require(__dirname + "/../models/JWKSModel.js");
var APIHelper = require(__dirname + "/../shared/APIHelper.js");
var GeneralMethods = require(__dirname + "/../shared/GeneralMethods.js");
var AuthManager = require(__dirname + "/AuthManager.js");

class JWTManager {


    constructor(config, id_token) {
        try {
            this.config = config;
            this.id_token = id_token;

            this.authResponse = new AuthResponseModel();
            this.authManager = new AuthManager(); 
            this.httpResponse = new HttpResponseModel();
            this.httpHeader = new HttpHeaderModel();
            this.jwt = new JWTModel();
            this.jwks = new JWKSModel();                                   
        } catch (error) {
            throw new Error(error)
        }        
    }

    DecodeJWT() {
        try {
            let header = this.id_token.split(".")[0];
            let payload = this.id_token.split(".")[1];
            let signature = this.id_token.split(".")[2];

            this.jwt.header = JSON.parse(GeneralMethods.Base64UrlDecode(header));
            this.jwt.payload = JSON.parse(GeneralMethods.Base64UrlDecode(payload));
            this.jwt.signature = GeneralMethods.Base64UrlDecode(signature);
            
            return this.jwt;            
        } catch (error) {
            throw new Error(error)
        }        
    }

    ValidateJWT(jwt, callback) {
        try {
            this.jwt = jwt;
            this.ValidateJWTHeader(function(response){
                if(response)
                    callback(this.ValidateJWTPayload() && this.VerifyJWTSingature());
            }.bind(this));            
        } catch (error) {
            throw new Error(error)
        }        
    }

    ValidateJWTHeader(callback) {
        try {
            APIHelper.Get(this.config.CoreIdentityBaseUrl + '/.well-known/openid-configuration/jwks', this.httpHeader, function(response){
                this.httpResponse = response
                this.jwks = JSON.parse(this.httpResponse.body).keys[0];
                //verify whether algorithm mentioned in Id Token (JWT) matches to the one in JWKS
                if(this.jwt.header.alg != this.jwks.alg)
                    throw "JWT algorithm doesn't match to the one mentioned in the Core API JWKS";
                //verify whether kid mentioned in Id Token (JWT) matches to the one in JWKS
                if(this.jwt.header.kid != this.jwks.kid)
                    throw "JWT kid doesn't match to the one mentioned in the Core API JWKS";            
                callback(true);
            }.bind(this));                         
        } catch (error) {
            throw new Error(error)
        }        
    }

    ValidateJWTPayload() {
        try {
            //verify issuer (iss) mentioned in Id Token (JWT) matches to the one in config.ini
            if(this.jwt.payload.iss != this.config.CoreIdentityBaseUrl)
               throw "JWT issuer (iss) doesn't match to the one mentioned in the config.ini";
            //verify audience (aud) mentioned in Id Token (JWT) matches to the one in config.ini
            if(this.jwt.payload.aud != this.config.ClientID)
               throw "JWT audience (aud) doesn't match to the one mentioned in the config.ini";
            //verify expiry time (exp) mentioned in Id Token (JWT) has not passed
            if(this.jwt.payload.exp < (new Date().getTime() / 1000))
               throw "JWT expiry time (exp) has already passed. Verify if the PHP server timezone (current timestamp) is correct or the JWT is already expired.";
            return true;
            
        } catch (error) {
            throw new Error(error)
        }        
    }

    VerifyJWTSingature() {
        try {
            // Implement RSA to vaerify Signature of JWT.
            return true;            
        } catch (error) {
            throw new Error(error)
        }        
    }

   
}
module.exports = JWTManager;