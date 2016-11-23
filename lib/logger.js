"use strict";


/**
 * Creates an instance of log.Log.
 *
 * @param {log~Log} Log
 * @param {libraryOptions} libraryOptions
 * @return {log~Log}
 */
module.exports = (Log, libraryOptions) => {
    var logger;

    logger = new Log(libraryOptions.logLevel);

    return logger;
};
