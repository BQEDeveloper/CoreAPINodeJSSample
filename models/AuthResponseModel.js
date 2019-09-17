class AuthResponseModel {
    constructor() {
        this.id_token;
        this.access_token;
        this.expires_in;
        this.token_type;
        this.refresh_token;
    }
}
module.exports = AuthResponseModel;