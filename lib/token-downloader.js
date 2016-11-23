"use strict";


/**
 * @typedef {Object} tokenDownloader
 * @property {Function} download
 * @property {Function} downloadToFile
 */


/**
 * Creates tokenDownloader class.
 *
 * @param {bluebird} bluebird
 * @param {fs} fs
 * @param {request} requestAsync
 * @param {requestHandler} requestHandler
 * @return {tokenDownloader}
 */
module.exports = (bluebird, fs, requestAsync, requestHandler) => {
    var Bluebird;

    Bluebird = bluebird;


    /**
     * Downloads content from OpenToken.
     *
     * @param {Object} requestOptions
     * @return {Promise.<http~IncomingMessage>}
     */
    function downloadAsync(requestOptions) {
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
    function downloadToFileAsync(requestOptions, stream) {
        if (typeof stream === "string") {
            stream = fs.createWriteStream(stream);
        }

        return new Bluebird((resolve, reject) => {
            requestAsync.get(requestOptions)
                .on("response", (response) => {
                    response
                        .pipe(stream)
                        .on("error", (err) => {
                            return reject(err);
                        })
                        .on("finish", () => {
                            requestHandler.checkResponse(response);

                            return resolve(stream.path.toString());
                        });
                });
        });
    }

    return {
        downloadAsync,
        downloadToFileAsync
    };
};
