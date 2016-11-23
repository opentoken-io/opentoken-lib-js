"use strict";

describe("opentokenLib", () => {
    var opentokenLib, req, signed;

    // Just some test data that is constant.
    const account = {
            code: "code",
            secret: "secret",
            id: "accountId"
        },
        host = "api.opentoken.io";

    beforeEach(() => {
        opentokenLib = require("../../lib/opentoken-lib")(host);
        signed = opentokenLib.createSignedTokenRequests(account.id, account.code, account.secret);
    });
    describe(".createSignedTokenRequests", () => {
        describe(".public", () => {
            it("is a SignedTokenRequest with the proper properties set.", () => {
                expect(signed.public).toEqual(jasmine.any(Object));
                expect(signed.public.accountId).toBe(account.id);
                expect(signed.public.code).toBe(account.code);
                expect(signed.public.secret).toBe(account.secret);
            });
        });
        describe(".private", () => {
            it("is a SignedTokenRequest with the proper properties set.", () => {
                expect(signed.private).toEqual(jasmine.any(Object));
                expect(signed.private.accountId).toBe(account.id);
                expect(signed.private.code).toBe(account.code);
                expect(signed.private.secret).toBe(account.secret);
            });
        });
    });
    describe(".createTokenRequest", () => {
        describe(".public", () => {
            it("is a TokenRequest with the proper properties set.", () => {
                req = opentokenLib.createTokenRequest(account.id);
                expect(req).toEqual(jasmine.any(Object));
                expect(req.accountId).toBe(account.id);
            });
        });
    });
});
