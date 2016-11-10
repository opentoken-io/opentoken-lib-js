"use strict";

module.exports = () => {
    function buildRequestOptions(contentType) {
        return {
            headers: {
                "content-type": contentType,
                "x-opentoken-date": new Date().toISOString(),
                host
            },
            body,
            method,
            url
        }
    }
};
