"use strict";

module.exports = (host, logLevel) => {
    var container, SignedTokenRequest;

    container = require("./container")(host, logLevel);
    SignedTokenRequest = container.resolve("SignedTokenRequest");

    return {
        createSignedTokenRequests(accountId, code, secret) {
            return {
                private: new SignedTokenRequest(accountId, false, code, secret),
                public: new SignedTokenRequest(accountId, true, code, secret)
            };
        }
    };
};
