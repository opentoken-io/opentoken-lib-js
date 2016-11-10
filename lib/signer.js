"use strict";

module.exports = (AuthorizationBuilder) => {
    /**
     * @param {string} code
     * @param {string} secret
     * @param {requestOptions} requestOptions
     */
    function sign(code, secret, requestOptions) {
        var builder;

        builder = new AuthorizationBuilder(code, secret, requestOptions);
        requestOptions.headers.Authorization = builder.createHeader();
    }

    return {
        sign
    };
};
