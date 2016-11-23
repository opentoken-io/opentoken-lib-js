"use strict";


/**
 * @typedef {Object} opentokenLib
 * @property {Function} createSignedTokenRequests
 * @property {Function} createTokenRequest
 */


/**
 * @typedef {Object} signedTokenRequests
 * @property {opentokenLibJs~SignedTokenRequest} private
 * @property {opentokenLibJs~SignedTokenRequest} public
 */


/**
 * @typedef {Object} libraryOptions
 * @property {string} logLevel
 */


/**
 * Creates an instance of opentokenLib.
 *
 * @param {string} host
 * @param {opentokenLibJs~libraryOptions} options
 * @return {opentokenLibJs~opentokenLib}
 */
module.exports = (host, options) => {
    var container, SignedTokenRequest, TokenRequest;

    container = require("./container")(host, options);
    SignedTokenRequest = container.resolve("SignedTokenRequest");
    TokenRequest = container.resolve("TokenRequest");


    /**
     * Creates signedTokenRequests.
     *
     * @param {string} accountId
     * @param {string} code
     * @param {string} secret
     * @return {opentokenLibJs~signedTokenRequests}
     */
    function createSignedTokenRequests(accountId, code, secret) {
        return {
            private: new SignedTokenRequest(accountId, false, code, secret),
            public: new SignedTokenRequest(accountId, true, code, secret)
        };
    }


    /**
     * Creates a TokenRequest.
     *
     * @param {string} accountId
     * @return {opentokenLibJs~TokenRequest}
     */
    function createTokenRequest(accountId) {
        return new TokenRequest(accountId);
    }

    return {
        createSignedTokenRequests,
        createTokenRequest
    };
};
