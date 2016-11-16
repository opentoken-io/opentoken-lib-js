"use strict";


/**
 * @typedef {ContentHasher}
 * @function push
 * @function pushList
 * @function hash
 */


/**
 * @param {crypto} crypto
 * @param {stream-to-promise} streamToPromise
 * @param {stream-concat} StreamConcat
 * @param {stream~Readable} StreamReadable
 * @return {ContentHasher}
 */
module.exports = (crypto, streamToPromise, StreamConcat, StreamReadable) => {
    /**
     * Creates a Readable stream out of a string.
     *
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


    /**
     * Responsible for hashing a list of content. The real reason to
     * use this class over
     */
    class ContentHasher {
        /**
         * @param {string} secret
         */
        constructor(secret) {
            this.contentList = [];
            this.secret = secret;
        }


        /**
         * Adds more content that will be used in the hash.
         *
         * @param {string|stream~Readable} content
         */
        push(content) {
            if (!(content instanceof StreamReadable)) {
                content = createStream(content);
            }

            this.contentList.push(content);
        }


        /**
         * Adds multiple items.
         *
         * @param {Array.<string|stream~Readable>} contentList
         */
        pushList(contentList) {
            contentList.forEach((content) => {
                this.push(content);
            });
        }


        /**
         * Hashes all the content together and returns the
         * result.
         *
         * @param {string} algorithm - The type of hashing algorithm
         *                             you would like to use.
         * @return {Promise<string>}
         */
        hash(algorithm) {
            var concat, hmac, stream;

            if (!algorithm) {
                algorithm = "sha256";
            }

            concat = new StreamConcat(this.contentList);
            hmac = crypto.createHmac(algorithm, this.secret);
            hmac.setEncoding("hex");
            stream = concat.pipe(hmac);

            return streamToPromise(stream).then((buffer) => {
                return buffer.toString();
            });
        }
    }

    return ContentHasher;
};
