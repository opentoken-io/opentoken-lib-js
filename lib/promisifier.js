"use strict";


/**
 * Creates promisifier.
 *
 * @param {bluebird} bluebird
 * @return {opentokenLibJs~promisifier}
 */
module.exports = (bluebird) => {
    return (otherModule) => {
        if (typeof otherModule === "function") {
            otherModule = bluebird.promisify(otherModule);
        }

        return bluebird.promisifyAll(otherModule);
    };
};
