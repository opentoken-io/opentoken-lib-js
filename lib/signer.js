"use strict";


/**
 * @typedef {Object} signer
 * @property {Function} sign
 */


/**
 * Creates a signer.
 *
 * @param {opentoken-lib-js~AuthorizationBuilder} AuthorizationBuilder
 * @return {opentoken-lib-js~signer}
 */
module.exports = (AuthorizationBuilder) => {
    /**
     * Sets the Authorization header with signed content.
     *
     * @param {string} code
     * @param {string} secret
     * @param {opentoken-lib-js~requestOptions} requestOptions
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
