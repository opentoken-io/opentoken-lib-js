"use strict";

describe("SignedTokenRequest", () => {
    var bluebird, container, fsMock, privateSigned, publicSigned, requestAsyncMock, requestHandler, requestMock, responseMock, SignedTokenRequest, signer, StreamReadable, url;

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
        container.register("request", requestMock);
        responseMock = require("../mock/response-mock")();
        container.register("logger", require("../mock/logger-mock")());
        fsMock = jasmine.createSpyObj("fs", [
            "createWriteStream"
        ]);
        container.register("fs", fsMock);
        requestAsyncMock = jasmine.createSpy("requestAsync");
        container.register("requestAsync", requestAsyncMock);
        signer = container.resolve("signer");
        requestHandler = container.resolve("requestHandler");
        SignedTokenRequest = container.resolve("SignedTokenRequest");
        StreamReadable = container.resolve("StreamReadable");
        url = `https://${host}/account/${account.id}/token`;
        privateSigned = new SignedTokenRequest(account.id, false, account.code, account.secret);
        publicSigned = new SignedTokenRequest(account.id, true, account.code, account.secret);
        spyOn(signer, "sign").andCallThrough();
        spyOn(requestHandler, "createUrl").andCallThrough();
        spyOn(requestHandler, "checkResponse").andCallThrough();
        spyOn(requestHandler, "buildRequestOptions").andCallThrough();
        requestMock.get.andReturn(requestMock);
        requestMock.post.andReturn(requestMock);
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
                expect(requestHandler.createUrl).toHaveBeenCalledWith(account.id, false, token);
                expect(requestHandler.buildRequestOptions).toHaveBeenCalledWith(url, method);
                expect(body).toEqual(resp.body);
                expect(requestAsyncMock).toHaveBeenCalled();
                expect(signer.sign).toHaveBeenCalled();
                actualRequestOpts = requestAsyncMock.argsForCall[0][0];
                expect(actualRequestOpts.method).toEqual(method);
                expect(actualRequestOpts.url).toEqual(url);
                assertAuthHeader(actualRequestOpts.headers.Authorization);
            });
        });
        it("fails to download due to generic error response", () => {
            var resp;

            resp = {
                statusCode: 401
            };
            requestAsyncMock.andReturn(bluebird.resolve(resp));

            return privateSigned.download(token).then(jasmine.fail, (err) => {
                expect(err.message).toEqual(`Error occurred: unauthorized, HTTP status code: ${resp.statusCode}.`);
                expect(requestAsyncMock).toHaveBeenCalled();
                expect(signer.sign).toHaveBeenCalled();
            });
        });
        it("fails to download due to unknown error response", () => {
            var resp;

            resp = {
                statusCode: 491
            };
            requestAsyncMock.andReturn(bluebird.resolve(resp));

            return privateSigned.download(token).then(jasmine.fail, (err) => {
                expect(err.message).toEqual(`Error occurred: unknown, HTTP status code: ${resp.statusCode}.`);
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

            return privateSigned.download(token).then(jasmine.fail, (err) => {
                expect(err.message).toEqual(`Error occurred: Failed to verify signature, HTTP status code: ${resp.statusCode}.`);
                expect(requestAsyncMock).toHaveBeenCalled();
                expect(signer.sign).toHaveBeenCalled();
            });
        });
    });
    describe(".upload", () => {
        it("successfuly uploads", () => {
            var actualRequestOpts, contents, method, resp;

            method = "POST";
            contents = "body";
            resp = {
                body: "test",
                statusCode: 201,
                headers: {
                    location: `${url}/${token}?public=true`
                }
            };
            requestAsyncMock.andReturn(bluebird.resolve(resp));

            return publicSigned.upload(contents).then((actualToken) => {
                expect(requestHandler.createUrl).toHaveBeenCalledWith(account.id, true);
                expect(requestHandler.buildRequestOptions).toHaveBeenCalledWith(`${url}?public=true`, method);
                expect(actualToken).toEqual(token);
                expect(signer.sign).toHaveBeenCalled();
                actualRequestOpts = requestAsyncMock.argsForCall[0][0];
                expect(actualRequestOpts.method).toEqual(method);
                expect(actualRequestOpts.url).toEqual(`${url}?public=true`);
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
            promise = privateSigned.downloadToFile(token, file).then((actualFile) => {
                expect(requestHandler.createUrl).toHaveBeenCalledWith(account.id, false, token);
                expect(requestHandler.buildRequestOptions).toHaveBeenCalledWith(url, "GET");
                expect(actualFile).toEqual(file);
                expect(signer.sign).toHaveBeenCalled();
            });

            // This is horrible but I could not find a better solution to it.
            // Have to wait for the signer.sign promise to resolve before emitting
            // the appropriate events to complete the response.
            setTimeout(() => {
                requestMock.emit("response", responseMock);
                stream.emit("finish");
            }, 250);

            return promise;
        });
    });
    describe(".uploadFromFile", () => {
        var uploadResp;

        uploadResp = {
            body: "test",
            statusCode: 201,
            headers: {
                location: `${url}/${token}`
            }
        };
        it("successfully uploads from a file", () => {
            var promise, stream;

            stream = createStream("Test");
            fsMock.createReadStream = jasmine.createSpy("fs.createReadStream").andReturn(stream);
            requestMock.on = (event, callback) => {
                callback(uploadResp);
            };
            promise = privateSigned.uploadFromFile("file.json").then((actualToken) => {
                expect(requestHandler.createUrl).toHaveBeenCalledWith(account.id, false);
                expect(requestHandler.buildRequestOptions).toHaveBeenCalledWith(url, "POST");
                expect(actualToken).toEqual(token);
                expect(signer.sign).toHaveBeenCalled();
            });

            // Basically the same thing as above. Have to have this event fired after
            // the signer has signed. I found no other way to do this than setTimeout.
            setTimeout(() => {
                stream.emit("end");
            }, 250);

            return promise;
        });
        it("successfully uploads from a file, stream preloaded", () => {
            var promise, stream;

            stream = createStream("Test");
            requestMock.on = (event, callback) => {
                callback(uploadResp);
            };
            promise = privateSigned.uploadFromFile(stream).then((actualToken) => {
                expect(actualToken).toEqual(token);
                expect(signer.sign).toHaveBeenCalled();
            });

            // Same as above. Need to have a slight pause before emitting this.
            setTimeout(() => {
                stream.emit("end");
            }, 250);

            return promise;
        });
    });
});
