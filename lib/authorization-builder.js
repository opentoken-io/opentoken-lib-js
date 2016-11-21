"use strict";


/**
 * @typedef {Object} AuthorizationBuilder - Builds components for signing requests for OpenToken.
 * @function buildHeaderValue
 * @function addSigningContent
 * @function createHeader
 * @property {Object} requireOptions
 */


/**
 * @param {ContentHasher} ContentHasher
 * @param {log} logger
 * @param {urijs} Uri
 * @return {AuthorizationBuilder}
 */
module.exports = (ContentHasher, logger, Uri) => {
    /**
     * Responsible for building the authorization header for an opentoken request.
     */
    class AuthorizationBuilder {
        /**
         * @param {string} code
         * @param {string} secret
         * @param {requestOptions} requestOptions
         * @param {string|stream~Readable} body
         */
        constructor(code, secret, requestOptions, body) {
            this.code = code;
            this.secret = secret;
            this.body = body;
            this.requestOptions = requestOptions;

            // This is done here so that when I used headerNameList in two
            // different places it is in a guaranteed order.
            this.headerNameList = Object.keys(this.requestOptions.headers);
        }


        /**
         * Builds the value that should be used for the Authorization header.
         *
         * @param {string} signature - The hashed value of the signing content.
         * @return {string}
         */
        buildHeaderValue(signature) {
            var signedHeaders, value;

            signedHeaders = this.headerNameList.join(" ");
            value = `OT1-HMAC-SHA256-HEX; access-code=${this.code}; signed-headers=${signedHeaders}; signature=${signature}`;

            return value;
        }


        /**
         * Pushes content to ContentHasher from requestOptions
         * in order to build a signature required for OpenToken requests.
         *
         * @param {ContentHasher} hasher
         */
        addSigningContent(hasher) {
            var uri, value;

            uri = new Uri(this.requestOptions.url);
            hasher.pushList([
                `${this.requestOptions.method}\n`,
                `${uri.path()}\n`,
                `${uri.query()}\n`
            ]);
            this.headerNameList.forEach((headerName) => {
                value = this.requestOptions.headers[headerName].trim();
                headerName = headerName.toLowerCase();

                if (headerName === "host") {
                    // OpenToken requires the host header to be lowercase.
                    value = value.toLowerCase();
                }

                hasher.push(`${headerName}:${value}\n`);
            });
            hasher.push("\n");

            if (this.body) {
                hasher.push(this.body);
            }
        }


        /**
         * Creates the authorization header value for the provided requestOptions.
         *
         * @return {Promise<string>}
         */
        createHeader() {
            var authorization, hasher;

            hasher = new ContentHasher(this.secret);
            this.addSigningContent(hasher);

            return hasher.hash().then((signature) => {
                authorization = this.buildHeaderValue(signature);
                logger.debug("Authorization header value:", authorization);

                return authorization;
            });
        }
    }

    return AuthorizationBuilder;
};
