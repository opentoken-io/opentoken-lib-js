"use strict";

module.exports = (Log, logLevel) => {
    var logger;

    logger = new Log(logLevel);

    return logger;
};
