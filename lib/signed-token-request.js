"use strict";

/**
 * @typedef {Object} SignedTokenRequest
 */

/**
 * Creates SignedTokenRequest class.
 *
 * @param {fs} fs
 * @param {string} host
 * @param {logger} logger
 * @param {signer} signer
 * @param {request} requestAsync
 * @param {requestHandler} requestHandler
 * @param {uri-js} Uri
 * @return {SignedTokenRequest}
 */
module.exports = (fs, host, logger, signer, requestAsync, requestHandler, Uri) => {
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
         * Creates an entry on OpenToken.
         *
         * @param {string} contents
         * @return {Promise}
         */
        create(contents) {
            var requestOptions, url;

            url = this.createUrl();

            requestOptions = requestHandler.buildRequestOptions(url, "POST", contents, "text/plain");
            signer.sign(this.code, this.secret, requestOptions);

            return requestAsync(requestOptions).then(requestHandler.checkResponse);
        }

        /**
         * Creates an entry on OpenToken.
         *
         * @param {string|ReadStream} stream
         * @return {Promise}
         */
        createFromFile(stream) {
            var requestOptions, url;

            if (typeof stream === "string") {
                stream = fs.createReadStream(stream);
            }

            url = this.createUrl();

            requestOptions = requestHandler.buildRequestOptions(url, "POST", stream, "application/octet-stream");
            signer.sign(this.code, this.secret, requestOptions);

            return requestAsync(requestOptions).then(requestHandler.checkResponse);
        }

        /**
         * Create URL for OpenToken.
         *
         * @param {string} token
         * @return {string}
         */
        createUrl(token) {
            var path, url;

            url = new Uri(host);
            path = `account/${this.accountId}/token`;

            if (typeof token !== "undefined") {
                path = `${path}/${token}`;
            }

            if (this.isPublic) {
                url.query({public: true});
            }

            url.path(path);

            return url.toString();
        }

        /**
         * Downloads content from OpenToken.
         */
        download() {
        }

        /**
         * Downloads content from OpenToken to a file.
         *
         * @param {string} filePath
         * @return {Promise}
         */
        downloadToFile(filePath) {
            var requestOptions, stream, url;

            if (typeof stream === "string") {
                stream = fs.createWriteStream(filePath);
            }

            url = this.createUrl();

            requestOptions = requestHandler.buildRequestOptions(url, "GET");
            signer.sign(this.code, this.secret, requestOptions);

            return requestAsync(requestOptions).then(requestHandler.checkResponse).pipe(stream);
        }
    }

    return SignedTokenRequest;
};
