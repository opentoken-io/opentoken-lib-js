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
 * @param {fs} fsAsync
 * @param {string} host
 * @param {logger} logger
 * @param {signer} signer
 * @param {request} request
 * @param {request} requestAsync
 * @param {requestHandler} requestHandler
 * @param {uri-js} Uri
 * @return {SignedTokenRequest}
 */
module.exports = (bluebird, fsAsync, host, logger, signer, request, requestAsync, requestHandler, Uri) => {
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
         * Create URL for OpenToken.
         *
         * @param {string} token
         * @return {string}
         */
        createUrl(token) {
            var path, url;

            url = new Uri(`https://${host}`);
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
         *
         * @param {string} token
         * @return {Promise}
         */
        download(token) {
            var requestOptions, url;

            url = this.createUrl(token);

            requestOptions = requestHandler.buildRequestOptions(url, "GET");
            signer.sign(this.code, this.secret, requestOptions);

            return requestAsync(requestOptions).then((response) => {
                requestHandler.checkResponse(response);

                return response.body;
            });
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

            if (typeof stream === "string") {
                stream = fsAsync.createWriteStream(stream);
            }

            url = this.createUrl(token);

            requestOptions = requestHandler.buildRequestOptions(url, "GET");
            signer.sign(this.code, this.secret, requestOptions);

            return new Bluebird((resolve) => {
                request(requestOptions)
                    .on("response", (response) => {
                        response
                            .pipe(stream)
                            .on("finish", () => {
                                requestHandler.checkResponse(response);

                                return resolve(stream.path.toString());
                            });
                    });
            });
        }


        /**
         * Uploads content to OpenToken.
         *
         * @param {string} contents
         * @return {Promise<string>} Token for the content that was uploaded.
         */
        upload(contents) {
            var requestOptions, url;

            url = this.createUrl();

            requestOptions = requestHandler.buildRequestOptions(url, "POST", contents);
            signer.sign(this.code, this.secret, requestOptions, contents);

            return requestAsync(requestOptions).then((response) => {
                var uri;

                requestHandler.checkResponse(response);
                uri = new Uri(response.headers.location, url);

                return uri.toString();
            });
        }


        /**
         * Creates an entry on OpenToken from given file.
         *
         * @param {string} filePath - Path of file to load.
         * @return {Promise<string>} Token for the content that was uploaded.
         */
        uploadFromFile(filePath) {
            // Temporarily reading in the file and calling create.
            // auth builder will have to be updated to accomodate streams
            // if possible. Working around it like this for now.
            return fsAsync.readFileAsync(filePath).then((contents) => {
                return this.upload(contents);
            });
        }
    }

    return SignedTokenRequest;
};
