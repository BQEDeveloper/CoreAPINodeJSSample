class AuthResponseModel {
    constructor() {
        this.id_token;
        this.access_token;
        this.expires_in;
        this.token_type;
        this.refresh_token;
        this.scope;
        this.endpoint;
    }
}
module.exports = AuthResponseModel;