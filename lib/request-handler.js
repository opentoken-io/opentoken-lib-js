"use strict";

/**
 * @typedef {Object} requestHandler
 */

/**
 * Creates requestHandler.
 *
 * @param {bluebird} bluebird
 * @param {dateService} dateService
 * @param {string} host
 * @param {logger} logger
 * @param {urijs} Uri
 * @return {requestHandler}
 */
module.exports = (bluebird, dateService, host, logger, Uri) => {
    // This error object is a last ditch attempt to supply info if
    // OpenToken does not provide a body.
    const error = {
        401: "unauthorized",
        403: "forbidden",
        404: "resource_not_found",
        500: "internal_server_error",
        unknown: "unknown"
    };


    /**
     * Build request options for a request to OpenToken.
     *
     * @param {string} url
     * @param {string} method
     * @param {string} contentType
     * @return {Object}
     */
    function buildRequestOptions(url, method, contentType) {
        if (typeof contentType === "undefined") {
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
     * Checks for an error response.
     *
     * @param {http~IncomingMessage} response
     * @throw {Error}
     */
    function checkResponse(response) {
        var body, message, statusCode;

        body = response.body;
        statusCode = response.statusCode;

        logger.debug(`Status Code: ${statusCode}`);
        logger.debug(`Response Body: ${body}`);

        if (statusCode > 299 || statusCode < 200) {
            // If OpenToken does not return a message in the body, I attempt to map
            // the status code to an error. If all else failes I return an known error.
            message = body.message;
            if (!message) {
                if (Object.keys(error).indexOf(statusCode) > 0) {
                    message = error[statusCode];
                } else {
                    message = error.unknown;
                }
            }
            message = `Error occurred: ${message}, HTTP status code: ${statusCode}.`;

            throw new Error(message);
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
            url.query({public: true});
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
