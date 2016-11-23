"use strict";


/**
 * @typedef {Object} signer
 * @property {Function} sign
 */


/**
 * Creates a signer.
 *
 * @param {opentokenLibJs~AuthorizationBuilder} AuthorizationBuilder
 * @return {opentokenLibJs~signer}
 */
module.exports = (AuthorizationBuilder) => {
    /**
     * Sets the Authorization header with signed content.
     *
     * @param {string} code
     * @param {string} secret
     * @param {opentokenLibJs~requestOptions} requestOptions
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
