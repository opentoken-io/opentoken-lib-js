"use strict";

module.exports = (host) => {
    var container, SignedTokenRequest;

    container = require("./container")(host);
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
