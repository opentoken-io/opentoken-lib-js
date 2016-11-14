"use strict";


/**
 * @typedef opentokenLib
 * @function createSignedTokenRequests
 * @function createTokenRequest
 */


/**
 * @typedef signedTokenRequests
 * @property {SignedTokenRequest} private
 * @property {SignedTokenRequest} public
 */


/**
 * Creates an instance of opentokenLib.
 *
 * @param {string} host
 * @param {string} logLevel
 * @return {opentokenLib}
 */
module.exports = (host, logLevel) => {
    var container, SignedTokenRequest, TokenRequest;

    container = require("./container")(host, logLevel);
    SignedTokenRequest = container.resolve("SignedTokenRequest");
    TokenRequest = container.resolve("TokenRequest");


    /**
     * Creates signedTokenRequests.
     *
     * @param {string} accountId
     * @param {string} code
     * @param {string} secret
     * @return {signedTokenRequests}
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
     * @return {TokenRequest}
     */
    function createTokenRequest(accountId) {
        return new TokenRequest(accountId);
    }

    return {
        createSignedTokenRequests,
        createTokenRequest
    };
};
