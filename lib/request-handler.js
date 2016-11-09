"use strict";

/**
 * @typedef {Object} requestHandler
 */

/**
 * Creates requestHandler.
 *
 * @param {bluebird} bluebird
 * @param {logger} logger
 * @return {requestHandler}
 */
module.exports = (bluebird, logger) => {
    /**
     * Build request options for a request to OpenToken.
     */
    function buildRequestOptions(url, host, method) {
        return {
            headers: {
                "content-type": "text/plain",
                "x-opentoken-date": new Date().toISOString(),
                host
            },
            method,
            url
        };
    }

    /**
     * Checks for an error response.
     *
     * @param {string} url
     * @param {http~IncomingMessage} response
     * @throw Error
     */
    function checkResponse(url, response) {
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
