"use strict";

module.exports = () => {
    var logger;

    logger = jasmine.createSpyObj("logger", [
        "console",
        "debug",
        "error",
        "info",
        "warn"
    ]);

    return logger;
};
