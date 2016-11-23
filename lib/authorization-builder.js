"use strict";


/**
 * @typedef {Object} AuthorizationBuilder builds components for signing requests for OpenToken.
 * @property {Function} buildHeaderValue
 * @property {Function} buildSigningContent
 * @property {Function} createHeader
 * @property {Object} requireOptions
 */


/**
 * @param {crypto} crypto
 * @param {log~Log} logger
 * @param {urijs} Uri
 * @return {AuthorizationBuilder}
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
         * @param {(Buffer|stream~Readable)} body
         */
        constructor(code, secret, requestOptions) {
            this.code = code;
            this.secret = secret;
            this.requestOptions = requestOptions;

            // This is done here so that when I use headerNameList in two
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
         * Builds a string of all the things that need to be
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
                    // OpenToken requires the host header to be lowercase.
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
         * Creates the authorization header value
         * @param {string} [algorithm=sha256] - The type of hashing algorithm.
         * @param {string} [encoding=hex] - The type of encoding to use.
         *
         * @return {string}
         */
        createHeader(algorithm, encoding) {
            var authorization, hmac, signature, signingContent;

            if (!algorithm) {
                algorithm = "sha256";
            }

            if (!encoding) {
                encoding = "hex";
            }

            signingContent = this.buildSigningContent();
            hmac = crypto.createHmac(algorithm, this.secret);

            hmac.update(signingContent, "binary");
            signature = hmac.digest(encoding);
            authorization = this.buildHeaderValue(signature);
            logger.debug("Authorization header value:", authorization);

            return authorization;
        }
    }

    return AuthorizationBuilder;
};
