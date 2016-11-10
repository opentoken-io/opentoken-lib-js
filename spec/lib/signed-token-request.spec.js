"use strict";

describe("SignedTokenRequest", () => {
    var AuthorizationBuilder, bluebird, contentHasher, dateMock, fsAsyncMock, loggerMock, requestAsyncMock, requestHandler, requestMock, SignedTokenRequest, signer, Uri;

    // Just some test data that is constant.
    const account = {
            code: "code",
            secret: "secret",
            id: "accountId"
        },
        host = "api.opentoken.io";

    beforeEach(() => {
        dateMock = jasmine.createSpyObj("date", ["now"]);
        dateMock.now.andReturn("NOW");
        Uri = require("urijs");
        contentHasher = require("../../lib/content-hasher")(require("hasha"), require("stream-to-promise"), require("stream-concat"), require("stream").Readable);
        loggerMock = require("../mock/logger-mock")();
        AuthorizationBuilder = require("../../lib/authorization-builder")(contentHasher, loggerMock, Uri);
        signer = require("../../lib/signer")(AuthorizationBuilder);
        spyOn(signer, "sign").andCallThrough();
        requestAsyncMock = jasmine.createSpy("requestAsync");
        requestMock = jasmine.createSpy("request");
        bluebird = require("bluebird");
        requestHandler = require("../../lib/request-handler")(bluebird, dateMock, host, loggerMock);
        SignedTokenRequest = require("../../lib/signed-token-request")(bluebird, fsAsyncMock, host, loggerMock, signer, requestMock, requestAsyncMock, requestHandler, Uri);
    });
    describe(".download", () => {
        it("downloads stuff", () => {
            var actualRequestOpts, authList, requestOptions, responseMock, st, token;

            token = "token";
            responseMock = {
                statusCode: 200
            };
            requestOptions = {
                headers: {
                    "content-type": "text/plain",
                    "x-opentoken-date": "NOW",
                    host
                },
                method: "GET",
                url: `https://${host}/account/${account.id}/token/${token}`
            };
            st = new SignedTokenRequest(account.id, false, account.code, account.secret);
            requestAsyncMock.andReturn(bluebird.resolve(responseMock));

            return st.download(token).then((body) => {
                expect(body).toEqual(responseMock.body);
                expect(requestAsyncMock).toHaveBeenCalled();
                expect(signer.sign).toHaveBeenCalled();
                actualRequestOpts = requestAsyncMock.argsForCall[0][0];
                expect(actualRequestOpts.method).toEqual(requestOptions.method);
                expect(actualRequestOpts.url).toEqual(requestOptions.url);

                // Asserting parts of the Authorization header.
                authList = actualRequestOpts.headers.Authorization.split(";");
                expect(authList[0]).toEqual("OT1-HMAC-SHA256-HEX");
                expect(authList[1].trim()).toEqual(`access-code=${account.code}`);
                expect(authList[2].trim()).toEqual("signed-headers=content-type x-opentoken-date host");
                expect(authList[3].trim()).toMatch("signature=[a-z0-9].*");
            });
        });
    });
});
