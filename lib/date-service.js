"use strict";


/**
 * @typedef {Object} dateService
 * @property {Function} now
 */


/**
 * Creates a dateService. Date service exposes a function for getting the
 * current time.
 *
 * @return {opentoken-lib-js~dateService}
 */
module.exports = () => {
    /**
     * Gets a UTC date string in ISO format.
     *
     * @return {string}
     */
    function now() {
        return new Date().toISOString();
    }

    return {
        now
    };
};
