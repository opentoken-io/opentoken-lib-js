"use strict";

module.exports = (bluebird) => {
    return (otherModule) => {
        if (typeof otherModule === "function") {
            otherModule = promise.promisify(otherModule);
        }

        return promise.promisifyAll(otherModule);
    };
};
