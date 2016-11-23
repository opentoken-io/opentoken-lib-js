"use strict";


/**
 * @typedef {Object} utils
 * @property {Function} createStream
 */


/**
 * Creates a test utils object.
 *
 * @param {stream~Readable} StreamReadable
 * @return {utils}
 */
module.exports = (StreamReadable) => {
    /**
     * @param {string} content
     * @return {stream~Readable}
     */
    function createStream(content) {
        var stream;

        stream = new StreamReadable();
        stream.push(content);
        stream.push(null);

        return stream;
    }

    return {
        createStream
    };
};
