"use strict";

describe("SignedTokenRequest", () => {
    var bluebird, container, fsMock, privateSigned, publicSigned, requestAsyncMock, requestHandler, requestMock, responseMock, SignedTokenRequest, signer, StreamReadable, url, utils;

    // Just some test data that is constant.
    const account = {
            code: "code",
            secret: "secret",
            id: "accountId"
        },
        host = "api.opentoken.io",
        token = "token";

    beforeEach(() => {
        container = require("../../lib/container")(host, {
            logLevel: "info"
        });
        bluebird = container.resolve("bluebird");
        responseMock = require("../mock/response-mock")();
        container.register("logger", require("../mock/logger-mock")());
        fsMock = jasmine.createSpyObj("fs", [
            "createWriteStream",
            "readFileAsync"
        ]);
        container.register("fs", fsMock);
        requestMock = require("../mock/request-mock")();
        requestAsyncMock = jasmine.createSpy("request");
        container.register("requestAsync", requestAsyncMock);
        signer = container.resolve("signer");
        requestHandler = container.resolve("requestHandler");
        SignedTokenRequest = container.resolve("SignedTokenRequest");
        StreamReadable = container.resolve("StreamReadable");
        url = `https://${host}/account/${account.id}/token`;
        privateSigned = new SignedTokenRequest(account.id, false, account.code, account.secret);
        publicSigned = new SignedTokenRequest(account.id, true, account.code, account.secret);
        spyOn(requestHandler, "createUrl").andCallThrough();
        spyOn(requestHandler, "checkResponse").andCallThrough();
        spyOn(requestHandler, "buildRequestOptions").andCallThrough();
        requestAsyncMock.get = jasmine.createSpy("request.get").andReturn(requestMock);
        requestAsyncMock.post = jasmine.createSpy("request.post").andReturn(requestMock);
        utils = require("../helper/utils")(StreamReadable);
        spyOn(signer, "sign").andCallThrough();
    });


    /**
     * Assert Authorization header.
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
        it("successfuly downloads", () => {
            var actualRequestOpts, resp;

            resp = {
                body: "test",
                statusCode: 200
            };
            url = `${url}/${token}`;
            requestAsyncMock.andReturn(bluebird.resolve(resp));

            return privateSigned.downloadAsync(token).then((body) => {
                expect(requestHandler.createUrl).toHaveBeenCalledWith(account.id, false, token);
                expect(requestHandler.buildRequestOptions).toHaveBeenCalledWith(url, "GET");
                expect(body).toEqual(resp.body);
                expect(requestAsyncMock).toHaveBeenCalled();
                expect(signer.sign).toHaveBeenCalled();
                actualRequestOpts = requestAsyncMock.argsForCall[0][0];
                expect(actualRequestOpts.method).toEqual("GET");
                expect(actualRequestOpts.url).toEqual(url);
                assertAuthHeader(actualRequestOpts.headers.Authorization);
            });
        });
        it("fails to download due to errorn no response body", () => {
            var resp;

            resp = {
                statusCode: 401
            };
            requestAsyncMock.andReturn(bluebird.resolve(resp));

            return privateSigned.downloadAsync(token).then(jasmine.fail, (err) => {
                expect(err.message).toEqual(`Error occurred: HTTP status code: ${resp.statusCode}`);
                expect(requestAsyncMock).toHaveBeenCalled();
                expect(signer.sign).toHaveBeenCalled();
            });
        });
        it("fails to download due to OpenToken error response", () => {
            var body, resp;

            body = {
                message: "Failed to verify signature",
                code: "Abcdefg"
            };
            resp = {
                body: JSON.stringify(body),
                statusCode: 401
            };
            requestAsyncMock.andReturn(bluebird.resolve(resp));

            return privateSigned.downloadAsync(token).then(jasmine.fail, (err) => {
                expect(err.message).toEqual(`Error occurred: HTTP status code: ${resp.statusCode}, message: Failed to verify signature`);
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
                statusCode: 201,
                headers: {
                    location: `${url}/${token}?public=true`
                }
            };
            requestAsyncMock.andReturn(bluebird.resolve(resp));

            return publicSigned.uploadAsync(contents).then((actualToken) => {
                expect(requestHandler.createUrl).toHaveBeenCalledWith(account.id, true);
                expect(requestHandler.buildRequestOptions).toHaveBeenCalledWith(`${url}?public=true`, "POST");
                expect(actualToken).toEqual(token);
                expect(signer.sign).toHaveBeenCalled();
                actualRequestOpts = requestAsyncMock.argsForCall[0][0];
                expect(actualRequestOpts.method).toEqual("POST");
                expect(actualRequestOpts.url).toEqual(`${url}?public=true`);
                assertAuthHeader(actualRequestOpts.headers.Authorization);
            });
        });
    });
    describe(".downloadToFile", () => {
        it("successfuly downloads to a \"file\" from public endpoint", () => {
            var file, promise, stream;

            file = "fakeFile";
            stream = utils.createStream("test");
            responseMock.pipe.andReturn(stream);
            fsMock.createWriteStream.andReturn({
                path: file
            });
            url = `${url}/${token}`;
            promise = privateSigned.downloadToFileAsync(token, file).then((actualFile) => {
                expect(requestHandler.createUrl).toHaveBeenCalledWith(account.id, false, token);
                expect(requestHandler.buildRequestOptions).toHaveBeenCalledWith(url, "GET");
                expect(actualFile).toEqual(file);
                expect(signer.sign).toHaveBeenCalled();
            });
            requestMock.emit("response", responseMock);
            stream.emit("finish");

            return promise;
        });
        it("fails to pipe response to writeStream.", () => {
            var file, promise, stream;

            file = "fakeFile";
            stream = utils.createStream("test");
            responseMock.pipe.andReturn(stream);
            fsMock.createWriteStream.andReturn({
                path: file
            });
            url = `${url}/${token}`;
            promise = privateSigned.downloadToFileAsync(token, file).then(jasmine.fail, () => {
                expect(requestHandler.createUrl).toHaveBeenCalledWith(account.id, false, token);
                expect(requestHandler.buildRequestOptions).toHaveBeenCalledWith(url, "GET");
                expect(signer.sign).toHaveBeenCalled();
            });
            requestMock.emit("response", responseMock);
            stream.emit("error", new Error("Failed to do stuff and stuff."));

            return promise;
        });
    });
    describe(".uploadFromFile", () => {
        it("successfully uploads from a file", () => {
            var promise, resp;

            resp = {
                body: "test",
                statusCode: 201,
                headers: {
                    location: `${url}/${token}`
                }
            };
            requestMock.on = (event, callback) => {
                return callback(resp);
            };
            fsMock.readFileAsync.andReturn(bluebird.resolve("test"));
            promise = privateSigned.uploadFromFileAsync("file.json").then((actualToken) => {
                expect(requestHandler.createUrl).toHaveBeenCalledWith(account.id, false);
                expect(requestHandler.buildRequestOptions).toHaveBeenCalledWith(url, "POST");
                expect(actualToken).toEqual(token);
                expect(signer.sign).toHaveBeenCalled();
            });

            return promise;
        });
    });
});
