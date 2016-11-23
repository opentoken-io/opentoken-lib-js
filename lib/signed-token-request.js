"use strict";


/**
 * @typedef {Object} SignedTokenRequest
 * @property {Function} downloadAsync
 * @property {Function} downloadToFileAsync
 * @property {Function} uploadAsync
 * @property {Function} uploadFromFileAsync
 */


/**
 * Creates SignedTokenRequest class.
 *
 * @param {bluebird} bluebird
 * @param {fs} fsAsync
 * @param {string} host
 * @param {log~Log} logger
 * @param {request} requestAsync
 * @param {opentokenLibJs~requestHandler} requestHandler
 * @param {signer} signer
 * @param {opentokenLibJs~tokenDownloader} tokenDownloader
 * @param {uri-js} Uri
 * @return {SignedTokenRequest}
 */
module.exports = (bluebird, fsAsync, host, logger, requestAsync, requestHandler, signer, tokenDownloader, Uri) => {
    var Bluebird;

    Bluebird = bluebird;


    /**
     * Interface for signed requests.
     */
    class SignedTokenRequest {
        /**
         * Constructor for SignedTokenRequest.
         *
         * @param {string} accountId - Account ID.
         * @param {boolean} isPublic
         * @param {string} code
         * @param {string} secret
         */
        constructor(accountId, isPublic, code, secret) {
            this.accountId = accountId;
            this.isPublic = isPublic;
            this.code = code;
            this.secret = secret;
        }


        /**
         * Downloads content from OpenToken.
         *
         * @param {string} token
         * @return {Promise.<string>}
         */
        downloadAsync(token) {
            var requestOptions, url;

            url = requestHandler.createUrl(this.accountId, this.isPublic, token);
            requestOptions = requestHandler.buildRequestOptions(url, "GET");
            signer.sign(this.code, this.secret, requestOptions);

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
            signer.sign(this.code, this.secret, requestOptions);

            return tokenDownloader.downloadToFileAsync(requestOptions, stream);
        }


        /**
         * Uploads content to OpenToken.
         *
         * @param {Buffer} contents
         * @return {Promise<string>} Token for the content that was uploaded.
         */
        uploadAsync(contents) {
            var requestOptions, url;

            url = requestHandler.createUrl(this.accountId, this.isPublic);
            requestOptions = requestHandler.buildRequestOptions(url, "POST");
            requestOptions.body = contents;
            signer.sign(this.code, this.secret, requestOptions);

            return requestAsync(requestOptions).then((response) => {
                var uri;

                requestHandler.checkResponse(response);
                uri = new Uri(response.headers.location);

                return uri.filename();
            });
        }


        /**
         * Creates an entry on OpenToken from given file.
         *
         * @param {string} filePath - Path of file to load.
         * @return {Promise<string>} Token for the content that was uploaded.
         */
        uploadFromFileAsync(filePath) {
            var requestOptions, url;

            url = requestHandler.createUrl(this.accountId, this.isPublic);
            requestOptions = requestHandler.buildRequestOptions(url, "POST");

            return fsAsync.readFileAsync(filePath).then((contents) => {
                requestOptions.body = contents;
                signer.sign(this.code, this.secret, requestOptions);

                return new Bluebird((resolve) => {
                    return requestAsync.post(requestOptions).on("response", (response) => {
                        var uri;

                        requestHandler.checkResponse(response);
                        uri = new Uri(response.headers.location);

                        return resolve(uri.filename());
                    });
                });
            });
        }
    }

    return SignedTokenRequest;
};
