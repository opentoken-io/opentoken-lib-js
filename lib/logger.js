"use strict";


/**
 * Creates a logger.
 *
 * @param {log} Log
 * @param {string} logLevel
 * @return {log}
 */
module.exports = (Log, logLevel) => {
    var logger;

    logger = new Log(logLevel);

    return logger;
};
