class HttpHeaderModel {
    constructor() {
        this.authorization;
        this.contentType = 'application/json; charset=UTF-8';
        this.userAgent = 'Mozilla/5.0';
    }
}
module.exports = HttpHeaderModel;