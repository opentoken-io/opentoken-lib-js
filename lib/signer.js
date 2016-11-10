"use strict";

module.exports = (AuthorizationBuilder) => {
    /**
     * @param {string} code
     * @param {string} secret
     * @param {requestOptions} requestOptions
     * @param {string|stream~Readable} body
     */
    function sign(code, secret, requestOptions, body) {
        var builder;

        builder = new AuthorizationBuilder(code, secret, requestOptions, body);
        requestOptions.headers.Authorization = builder.createHeader();
    }

    return {
        sign
    };
};
