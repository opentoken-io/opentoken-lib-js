"use strict";

describe("SignedTokenRequest", () => {
    var bluebird, container, dateServiceMock, fsMock, requestAsyncMock, requestMock, responseMock, SignedTokenRequest, signer;

    // Just some test data that is constant.
    const account = {
            code: "code",
            secret: "secret",
            id: "accountId"
        },
        host = "api.opentoken.io";

    beforeEach(() => {
        container = require("../../lib/container")(host, "info");
        bluebird = container.resolve("bluebird");
        requestMock = require("../mock/request-mock")();
        responseMock = require("../mock/response-mock")();
        container.register("request", jasmine.createSpy("request").andReturn(requestMock));
        dateServiceMock = jasmine.createSpyObj("date", ["now"]);
        dateServiceMock.now.andReturn("NOW");
        container.register("dateService", dateServiceMock);
        container.register("logger", require("../mock/logger-mock")());
        fsMock = jasmine.createSpyObj("fs", ["createWriteStream"]);
        container.register("fs", fsMock);
        requestAsyncMock = jasmine.createSpy("requestAsync");
        container.register("requestAsync", requestAsyncMock);
        signer = container.resolve("signer");
        spyOn(signer, "sign").andCallThrough();
        SignedTokenRequest = container.resolve("SignedTokenRequest");
    });


    /**
     * Assert Authrization header.
     *
     * @param {string} authHeader
     */
    function assertAuthHeader(authHeader) {
        var authList;

        authList = authHeader.split(";");
        expect(authList[0]).toEqual("OT1-HMAC-SHA256-HEX");
        expect(authList[1].trim()).toEqual(`access-code=${account.code}`);
        expect(authList[2].trim()).toEqual("signed-headers=content-type x-opentoken-date host");
        expect(authList[3].trim()).toMatch("signature=[a-z0-9].*");
    }
    describe(".download", () => {
        it("downloads stuff", () => {
            var actualRequestOpts, method, resp, st, token, url;

            token = "token";
            resp = {
                body: "test",
                statusCode: 200
            };
            method = "GET";
            url = `https://${host}/account/${account.id}/token/${token}`;
            st = new SignedTokenRequest(account.id, false, account.code, account.secret);
            requestAsyncMock.andReturn(bluebird.resolve(resp));

            return st.download(token).then((body) => {
                expect(body).toEqual(resp.body);
                expect(requestAsyncMock).toHaveBeenCalled();
                expect(signer.sign).toHaveBeenCalled();
                actualRequestOpts = requestAsyncMock.argsForCall[0][0];
                expect(actualRequestOpts.method).toEqual(method);
                expect(actualRequestOpts.url).toEqual(url);

                // Asserting parts of the Authorization header.
                assertAuthHeader(actualRequestOpts.headers.Authorization);
            });
        });
    });
    describe(".upload", () => {
        it("successfuly uploads", () => {
            var actualRequestOpts, contents, resp, st, token, url;

            token = "token";
            url = `https://${host}/account/${account.id}/token`;
            st = new SignedTokenRequest(account.id, false, account.code, account.secret);
            contents = "body";
            resp = {
                body: "test",
                statusCode: 200,
                headers: {
                    location: `${url}/${token}`
                }
            };
            requestAsyncMock.andReturn(bluebird.resolve(resp));

            return st.upload(contents).then((actualToken) => {
                expect(actualToken).toEqual(token);
                expect(signer.sign).toHaveBeenCalled();
                actualRequestOpts = requestAsyncMock.argsForCall[0][0];
                expect(actualRequestOpts.method).toEqual("POST");
                expect(actualRequestOpts.url).toEqual(url);

                // Asserting parts of the Authorization header.
                assertAuthHeader(actualRequestOpts.headers.Authorization);
            });
        });
    });
    describe(".downloadToFile", () => {
        it("successfuly downloads to a \"file\" from public endpoint", () => {
            var file, mockedStream, promise, st, StreamReadable, token;

            token = "token";
            file = "fakeFile";

            StreamReadable = require("stream").Readable;
            mockedStream = new StreamReadable();
            responseMock.pipe.andReturn(mockedStream);
            fsMock.createWriteStream.andReturn({
                path: file
            });
            st = new SignedTokenRequest(account.id, true, account.code, account.secret);

            promise = st.downloadToFile(token, file).then((actualFile) => {
                expect(actualFile).toEqual(file);
                expect(signer.sign).toHaveBeenCalled();
            });

            requestMock.emit("response", responseMock);
            mockedStream.emit("finish");

            return promise;
        });
    });
});
