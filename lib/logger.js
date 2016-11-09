"use strict";

/**
 * @typedef {Object} logger
 * @function debug
 * @function error
 * @function info
 * @function warn
 */

/**
 * Creates logger.
 *
 * @param {string} logLevel - Set logLevel. Accepts warning, info, and debug.
 * @return {logger}
 */
module.exports = (logLevel) => {
    return {
        /**
         * Displays a message to the console only.
         *
         * @param {*} data All parameters are sent to console.log.
         */
        console() {
            var args;

            args = [].slice.call(arguments);
            console.log.apply(console, args);
        },


        /**
         * Logs debug statements to stderr only if
         * logLevel is debug.
         *
         * @param {string} text
         */
        debug(text) {
            if (logLevel === "debug") {
                console.error(`DEBUG: ${text}`);
            }
        },


        /**
         * Logs errors to stderr
         *
         * @param {string} text
         */
        error(text) {
            console.error(`ERROR: ${text}`);
        },


        /**
         * Logs info statements to stdout. If logLevel is info or debug.
         *
         * @param {string} text
         */
        info(text) {
            if (logLevel === "debug" || logLevel === "info") {
                console.log(text);
            }
        },


        /**
         * Logs warn statments to stderr.
         *
         * @param {string} text
         */
        warn(text) {
            console.error(`WARN: ${text}`);
        }
    };
};
