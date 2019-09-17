class JWTPayload {
    constructor() {
        this.nbf;
        this.exp;
        this.iss;
        this.aud;
        this.iat;
        this.at_hash;
        this.sid;
        this.sub;
        this.auth_time;
        this.idp;
        this.amr = [];
    }
}
module.exports = JWTPayload;