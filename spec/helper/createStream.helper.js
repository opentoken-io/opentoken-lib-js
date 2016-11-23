"use strict";


/**
 * Creates a readable stream.
 *
 * @param {string} content
 * @return {stream~Readable}
 */
jasmine.createStream = (content) => {
    var stream, StreamReadable;

    StreamReadable = require("stream").Readable;
    stream = new StreamReadable();
    stream.push(content);
    stream.push(null);

    return stream;
};
