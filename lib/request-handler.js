"use strict";

/**
 * @typedef {Object} requestHandler
 */

/**
 * Creates requestHandler.
 *
 * @param {bluebird} bluebird
 * @param {string} host
 * @param {logger} logger
 * @return {requestHandler}
 */
module.exports = (bluebird, host, logger) => {
    /**
     * Build request options for a request to OpenToken.
     *
     * @param {string} url
     * @param {string} method
     * @param {string|ReadStream} body
     * @param {string} contentType
     * @return {Object}
     */
    function buildRequestOptions(url, method, body, contentType) {
        if (typeof contentType === "undefined") {
            contentType = "text/plain";
        }

        return {
            headers: {
                "content-type": contentType,
                "x-opentoken-date": new Date().toISOString(),
                host
            },
            body,
            method,
            url
        };
    }

    /**
     * Checks for an error response.
     *
     * @param {http~IncomingMessage} response
     * @throw Error
     */
    function checkResponse(response) {
        var body, statusCode;

        body = response.body;
        statusCode = response.statusCode;

        logger.debug(`Status Code: ${statusCode}`);
        logger.debug(`Response Body: ${body}`);

        if (statusCode > 299 || statusCode < 200) {
            throw new Error(`Detected failure in response.  Status code: ${statusCode} Body: ${body}`);
        }
    }

    return {
        buildRequestOptions,
        checkResponse
    };
};
