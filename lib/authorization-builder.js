"use strict";

/**
 * @typedef {Object} AuthorizationBuilder - Builds components for signing requests for OpenToken.
 * @function buildHeaderValue
 * @function buildSigningContent
 * @function createHeader
 * @property {Object} requireOptions
 */

module.exports = (crypto, logger, Uri) => {
    /**
     * Responsible for building the authorization header for an opentoken request.
     */
    class AuthorizationBuilder {
        /**
         * @param {string} code
         * @param {string} secret
         * @param {requestOptions} requestOptions
         */
        constructor(code, secret, requestOptions) {
            this.code = code;
            this.secret = secret;
            this.requestOptions = requestOptions;

            // This is done here so that when I used it in two different places
            // it is in a guaranteed order.
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
         * Builds a string which are all the things that need to be
         * hashed to build the signature.
         *
         * @return {string}
         */
        buildSigningContent() {
            var result, uri, value;

            uri = new Uri(this.requestOptions.url);
            result = [
                this.requestOptions.method,
                uri.path(),
                uri.query()
            ];

            this.headerNameList.forEach((headerName) => {
                value = this.requestOptions.headers[headerName].trim();
                headerName = headerName.toLowerCase();

                if (headerName === "host") {
                    // The Host header must be changed to lowercase because
                    // DNS is case insensitive.
                    value = value.toLowerCase();
                }

                result.push(`${headerName}:${value}`);
            });

            result.push("");
            if (this.requestOptions.body) {
                result.push(this.requestOptions.body);
            } else {
                result.push("");
            }

            result = result.join("\n");
            logger.debug("Signing content:", result);

            return result;
        }

        /**
         * Creates the authorization header value for the provided requestOptions.
         *
         * @return {string}
         */
        createHeader() {
            var authorization, hmac, signature, signingContent;

            signingContent = this.buildSigningContent();
            hmac = crypto.createHmac("sha256", this.secret);

            hmac.update(signingContent, "binary");
            signature = hmac.digest("hex");
            authorization = this.buildHeaderValue(signature);
            logger.debug("Authorization header value:", authorization);

            return authorization;
        }
    }

    return AuthorizationBuilder;
};
