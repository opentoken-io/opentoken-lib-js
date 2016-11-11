"use strict";


/**
 * @typedef {Object} tokenDownloader
 * @function download
 * @function downloadToFile
 */


/**
 * Creates tokenDownloader class.
 *
 * @param {bluebird} bluebird
 * @param {fs} fs
 * @param {request} request
 * @param {request} requestAsync
 * @param {requestHandler} requestHandler
 * @return {tokenDownloader}
 */
module.exports = (bluebird, fs, request, requestAsync, requestHandler) => {
    var Bluebird;

    Bluebird = bluebird;


    /**
     * Downloads content from OpenToken.
     *
     * @param {Object} requestOptions
     * @return {Promise.<http~IncomingMessage>}
     */
    function download(requestOptions) {
        return requestAsync(requestOptions).then((response) => {
            requestHandler.checkResponse(response);

            return response.body;
        });
    }


    /**
     * Downloads content from OpenToken to a file.
     *
     * @param {Object} requestOptions
     * @param {string|WriteStream} stream
     * @return {Promise.<string>}
     */
    function downloadToFile(requestOptions, stream) {
        if (typeof stream === "string") {
            stream = fs.createWriteStream(stream);
        }

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

    return {
        download,
        downloadToFile
    };
};
