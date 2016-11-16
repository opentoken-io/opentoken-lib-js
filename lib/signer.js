"use strict";


/**
 * @typedef {signer}
 * @function sign
 */


/**
 * Creates signer.
 *
 * @param {AuthorizationBuilder} AuthorizationBuilder
 * @return {signer}
 */
module.exports = (AuthorizationBuilder) => {
    /**
     * @param {string} code
     * @param {string} secret
     * @param {requestOptions} requestOptions
     * @param {string|stream~Readable} body
     *
     * @return {Promise}
     */
    function sign(code, secret, requestOptions, body) {
        var builder;

        builder = new AuthorizationBuilder(code, secret, requestOptions, body);

        return builder.createHeader().then((auth) => {
            requestOptions.headers.Authorization = auth;
        });
    }

    return {
        sign
    };
};
