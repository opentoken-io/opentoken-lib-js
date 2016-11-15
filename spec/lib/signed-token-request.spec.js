"use strict";

describe("SignedTokenRequest", () => {
    var bluebird, container, dateServiceMock, fsMock, privateSigned, publicSigned, requestAsyncMock, requestMock, responseMock, SignedTokenRequest, signer, StreamReadable, url;

    // Just some test data that is constant.
    const account = {
            code: "code",
            secret: "secret",
            id: "accountId"
        },
        host = "api.opentoken.io",
        token = "token";

    beforeEach(() => {
        container = require("../../lib/container")(host, "info");
        bluebird = container.resolve("bluebird");
        requestMock = require("../mock/request-mock")();
        requestMock.get.andReturn(requestMock);
        requestMock.post.andReturn(requestMock);
        responseMock = require("../mock/response-mock")();
        container.register("request", requestMock);
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
        StreamReadable = container.resolve("StreamReadable");
        url = `https://${host}/account/${account.id}/token`;
        privateSigned = new SignedTokenRequest(account.id, false, account.code, account.secret);
        publicSigned = new SignedTokenRequest(account.id, true, account.code, account.secret);
    });


    /**
     * @param {string} content
     * @return {stream~Readable}
     */
    function createStream(content) {
        var stream;

        stream = new StreamReadable();
        stream.push(content);
        stream.push(null);

        return stream;
    }


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
        var method;

        method = "GET";
        it("successfuly downloads", () => {
            var actualRequestOpts, resp;

            resp = {
                body: "test",
                statusCode: 200
            };
            url = `${url}/${token}`;
            requestAsyncMock.andReturn(bluebird.resolve(resp));

            return privateSigned.download(token).then((body) => {
                expect(body).toEqual(resp.body);
                expect(requestAsyncMock).toHaveBeenCalled();
                expect(signer.sign).toHaveBeenCalled();
                actualRequestOpts = requestAsyncMock.argsForCall[0][0];
                expect(actualRequestOpts.method).toEqual(method);
                expect(actualRequestOpts.url).toEqual(url);
                assertAuthHeader(actualRequestOpts.headers.Authorization);
            });
        });
        it("fails to download due to OpenToken error response", () => {
            var resp;

            resp = {
                body: {
                    message: "Failed to verify signature",
                    code: "Abcdefg"
                },
                statusCode: 401
            };
            requestAsyncMock.andReturn(bluebird.resolve(resp));

            return privateSigned.download(token).then(jasmine.fail, (err) => {
                expect(err.message).toEqual(`Error occurred: ${resp.body.message}, HTTP status code: ${resp.statusCode}.`);
                expect(requestAsyncMock).toHaveBeenCalled();
                expect(signer.sign).toHaveBeenCalled();
            });
        });
    });
    describe(".upload", () => {
        it("successfuly uploads", () => {
            var actualRequestOpts, contents, resp;

            contents = "body";
            resp = {
                body: "test",
                statusCode: 200,
                headers: {
                    location: `${url}/${token}`
                }
            };
            requestAsyncMock.andReturn(bluebird.resolve(resp));

            return privateSigned.upload(contents).then((actualToken) => {
                expect(actualToken).toEqual(token);
                expect(signer.sign).toHaveBeenCalled();
                actualRequestOpts = requestAsyncMock.argsForCall[0][0];
                expect(actualRequestOpts.method).toEqual("POST");
                expect(actualRequestOpts.url).toEqual(url);
                assertAuthHeader(actualRequestOpts.headers.Authorization);
            });
        });
    });
    describe(".downloadToFile", () => {
        it("successfuly downloads to a \"file\" from public endpoint", () => {
            var file, promise, stream;

            file = "fakeFile";
            stream = createStream("test");
            responseMock.pipe.andReturn(stream);
            fsMock.createWriteStream.andReturn({
                path: file
            });
            url = `${url}/${token}`;
            promise = publicSigned.downloadToFile(token, file).then((actualFile) => {
                expect(actualFile).toEqual(file);
                expect(signer.sign).toHaveBeenCalled();
            });
            requestMock.emit("response", responseMock);
            stream.emit("finish");

            return promise;
        });
    });
});
