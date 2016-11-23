"use strict";


/**
 * @typedef {Object} requestHandler
 * @property {Function} buildRequestOptions
 * @property {Function} checkResponse
 * @property {Function} createUrl
 */


/**
 * Creates requestHandler.
 *
 * @param {bluebird} bluebird
 * @param {opentokenLibJs~dateService} dateService
 * @param {string} host
 * @param {log~Log} logger
 * @param {urijs} Uri
 * @return {opentokenLibJs~requestHandler}
 */
module.exports = (bluebird, dateService, host, logger, Uri) => {
    /**
     * Build request options for a request to OpenToken.
     *
     * @param {string} url
     * @param {string} method
     * @param {string} contentType
     * @return {Object}
     */
    function buildRequestOptions(url, method, contentType) {
        if (!contentType) {
            contentType = "text/plain";
        }

        return {
            headers: {
                "content-type": contentType,
                "x-opentoken-date": dateService.now(),
                host
            },
            method,
            url
        };
    }


    /**
     * Creates error from an error response from OpenToken.
     *
     * @param {string} body
     * @param {Number} statusCode
     * @throw {Error}
     */
    function createErrorResponse(body, statusCode) {
        var errMsg, message;

        // If OpenToken does not return a message in the body, I attempt to map
        // the status code to an error. If all else fails, I return an unknown error.
        try {
            body = JSON.parse(body);
        } catch (e) {
            logger.debug("Failed to parse response body to JSON.");
        }

        if (body) {
            message = body.message;
        }

        errMsg = `Error occurred: HTTP status code: ${statusCode}`;

        if (message) {
            errMsg = `${errMsg}, message: ${message}`;
        }

        throw new Error(errMsg);
    }


    /**
     * Checks for an error response.
     *
     * @param {http~IncomingMessage} response
     */
    function checkResponse(response) {
        var body, statusCode;

        body = response.body;
        statusCode = response.statusCode;
        logger.debug(`Status Code: ${statusCode}`);
        logger.debug(`Response Body: ${body}`);

        if (statusCode > 299 || statusCode < 200) {
            createErrorResponse(body, statusCode);
        }
    }


    /**
     * Create URL for OpenToken.
     *
     * @param {string} accountId
     * @param {boolean} isPublic
     * @param {string} token
     * @return {string}
     */
    function createUrl(accountId, isPublic, token) {
        var path, url;

        url = new Uri(`https://${host}`);
        path = `account/${accountId}/token`;

        if (typeof token !== "undefined") {
            path = `${path}/${token}`;
        }

        if (isPublic) {
            url.query({
                public: true
            });
        }

        url.path(path);

        return url.toString();
    }

    return {
        buildRequestOptions,
        checkResponse,
        createUrl
    };
};
