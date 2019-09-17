var HttpResponseModel = require(__dirname + "/../models/HttpResponseModel.js");
const https = require('https');

class APIHelper {
    
    constructor() {
        this.httpResponse = new HttpResponseModel();
    }
    static Get(url, httpHeader, callback) {
        try {
            let httpResponse = new HttpResponseModel();      
            var options = {
                method: 'GET',
                headers: {
                    'Content-Type': httpHeader.contentType, 
                    'User-Agent': httpHeader.userAgent,                    
                }
              }
              if(httpHeader.authorization)
                options.headers.authorization = httpHeader.authorization;

            const req = https.request(url, options, (res) => {

                httpResponse.header_code = res.statusCode;
                httpResponse.header = res.headers
                httpResponse.response = res;

                let data = '';
                // A chunk of data has been recieved.
                res.on('data', (chunk) => {
                    data += chunk;
                });
                // The whole response has been received. 
                res.on('end', () => {                   
                    httpResponse.body = data;
                    callback(httpResponse);                    
                });

            }).on("error", (err) => {
                throw new Error(err)
            });
            req.end()
            
        } catch (error) {
            throw new Error(error)
        }        
    }

    static Post(url, data, httpHeader, callback) {
        try {                  
            var options = {
                method: 'POST',
                headers: {
                    'Content-Type': httpHeader.contentType, 
                    'User-Agent': httpHeader.userAgent,                    
                }
              }
              if(httpHeader.authorization)
                options.headers.authorization = httpHeader.authorization;

            const req = https.request(url, options, (res) => { 
                this.httpResponse = new HttpResponseModel();
                this.httpResponse.header_code = res.statusCode;
                this.httpResponse.header = res.headers
                this.httpResponse.response = res;

                let responseData = '';

                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                // The whole response has been received. 
                res.on('end', () => {                   
                    this.httpResponse.body = responseData;
                    callback(this.httpResponse);                    
                });

            }).on("error", (err) => {
                throw new Error(err)
            });
            req.write(data);
            req.end()
            
        } catch (error) {
            throw new Error(error)
        }        
    }

    static Put(url, data, httpHeader, callback) {
        try {
            let httpResponse = new HttpResponseModel();      
            var options = {
                method: 'PUT',
                headers: {
                    'Content-Type': httpHeader.contentType, 
                    'User-Agent': httpHeader.userAgent,                    
                }
              }
              if(httpHeader.authorization)
                options.headers.authorization = httpHeader.authorization;

            const req = https.request(url, options, (res) => {                

                httpResponse.header_code = res.statusCode;
                httpResponse.header = res.headers
                httpResponse.response = res;

                res.on('data', (chunk) => {
                    process.stdout.write(chunk);
                });
                // The whole response has been received. 
                res.on('end', () => {                   
                    httpResponse.body = data;
                    callback(httpResponse);                    
                });

            }).on("error", (err) => {
                throw new Error(err)
            });
            req.write(data);
            req.end()
            
        } catch (error) {
            throw new Error(error)
        }        
    }

    static Delete(url, httpHeader, callback) {
        try {
            let httpResponse = new HttpResponseModel();      
            var options = {
                method: 'DELETE',
                headers: {
                    'Content-Type': httpHeader.contentType, 
                    'User-Agent': httpHeader.userAgent,                    
                }
              }
              if(httpHeader.authorization)
                options.headers.authorization = httpHeader.authorization;

            const req = https.request(url, options, (res) => {

                httpResponse.header_code = res.statusCode;
                httpResponse.header = res.headers
                httpResponse.response = res;

                let data = '';
                // A chunk of data has been recieved.
                res.on('data', (chunk) => {
                    data += chunk;
                });
                // The whole response has been received. 
                res.on('end', () => {                   
                    httpResponse.body = data;
                    callback(httpResponse);                    
                });

            }).on("error", (err) => {
                throw new Error(err)
            });
            req.end()
            
        } catch (error) {
            throw new Error(error)
        }        
    }

}
module.exports = APIHelper;