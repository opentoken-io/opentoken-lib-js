"use strict";


/**
 * @typedef {Object} TokenRequest
 * @function downloadAsync
 * @function downloadToFileAsync
 */


/**
 * Creates TokenRequest class.
 *
 * @param {fs} fs
 * @param {string} host
 * @param {logger} logger
 * @param {requestHandler} requestHandler
 * @param {tokenDownloader} tokenDownloader
 * @return {SignedTokenRequest}
 */
module.exports = (fs, host, logger, requestHandler, tokenDownloader) => {
    /**
     * Interface for public token requests.
     */
    class TokenRequest {
        /**
         * Constructor for TokenRequest.
         *
         * @param {string} accountId
         */
        constructor(accountId) {
            this.accountId = accountId;
            this.isPublic = true;
        }


        /**
         * Downloads content from OpenToken.
         *
         * @param {string} token
         * @return {Promise}
         */
        downloadAsync(token) {
            var requestOptions, url;

            url = requestHandler.createUrl(this.accountId, this.isPublic, token);
            requestOptions = requestHandler.buildRequestOptions(url, "GET");

            return tokenDownloader.downloadAsync(requestOptions);
        }


        /**
         * Downloads content from OpenToken to a file.
         *
         * @param {string} token
         * @param {string|WriteStream} stream
         * @return {Promise.<string>}
         */
        downloadToFileAsync(token, stream) {
            var requestOptions, url;

            url = requestHandler.createUrl(this.accountId, this.isPublic, token);
            requestOptions = requestHandler.buildRequestOptions(url, "GET");

            return tokenDownloader.downloadToFileAsync(requestOptions, stream);
        }
    }

    return TokenRequest;
};
