"use strict";


/**
 * @typedef {Object} SignedTokenRequest
 * @function download
 * @function downloadToFile
 * @function upload
 * @function uploadFromFile
 */


/**
 * Creates SignedTokenRequest class.
 *
 * @param {bluebird} bluebird
 * @param {fs} fs
 * @param {string} host
 * @param {logger} logger
 * @param {signer} signer
 * @param {request} request
 * @param {request} requestAsync
 * @param {requestHandler} requestHandler
 * @param {tokenDownloader} tokenDownloader
 * @param {uri-js} Uri
 * @return {SignedTokenRequest}
 */
module.exports = (bluebird, fs, host, logger, signer, request, requestAsync, requestHandler, tokenDownloader, Uri) => {
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
         * @return {Promise}
         */
        download(token) {
            var requestOptions, url;

            url = requestHandler.createUrl(this.accountId, this.isPublic, token);

            requestOptions = requestHandler.buildRequestOptions(url, "GET");
            signer.sign(this.code, this.secret, requestOptions);

            return tokenDownloader.download(requestOptions);
        }


        /**
         * Downloads content from OpenToken to a file.
         *
         * @param {string} token
         * @param {string|WriteStream} stream
         * @return {Promise.<string>}
         */
        downloadToFile(token, stream) {
            var requestOptions, url;

            url = requestHandler.createUrl(token);

            requestOptions = requestHandler.buildRequestOptions(url, "GET");
            signer.sign(this.code, this.secret, requestOptions);

            return tokenDownloader.downloadToFile(requestOptions, stream);
        }


        /**
         * Uploads content to OpenToken.
         *
         * @param {string} contents
         * @return {Promise<string>} Token for the content that was uploaded.
         */
        upload(contents) {
            var requestOptions, url;

            url = requestHandler.createUrl(this.accountId, this.isPublic);

            requestOptions = requestHandler.buildRequestOptions(url, "POST");
            requestOptions.body = contents;

            return signer.sign(this.code, this.secret, requestOptions, contents).then(() => {
                return requestAsync(requestOptions).then((response) => {
                    var uri;

                    requestHandler.checkResponse(response);
                    uri = new Uri(response.headers.location, url);

                    return uri.filename();
                });
            });
        }


        /**
         * Creates an entry on OpenToken from given file.
         *
         * @param {string|ReadStream} stream - Path of file to load.
         * @return {Promise<string>} Token for the content that was uploaded.
         */
        uploadFromFile(stream) {
            var requestOptions, url;

            if (typeof stream === "string") {
                stream = fs.createReadStream(stream);
            }

            url = requestHandler.createUrl(this.accountId, this.isPublic);

            requestOptions = requestHandler.buildRequestOptions(url, "POST");

            return signer.sign(this.code, this.secret, requestOptions, stream).then(() => {
                return new Bluebird((resolve) => {
                    stream.pipe(request(requestOptions)
                        .on("response", (response) => {
                            var uri;

                            requestHandler.checkResponse(response);
                            uri = new Uri(response.headers.location, url);

                            return resolve(uri.filename());
                        }));
                });
            });
        }
    }

    return SignedTokenRequest;
};
