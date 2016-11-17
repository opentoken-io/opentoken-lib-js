"use strict";

describe("TokenRequest", () => {
    var bluebird, container, fsMock, requestAsyncMock, requestMock, responseMock, TokenRequest, tr;

    const accountId = "accountId",
        host = "api.opentoken.io",
        token = "testToken";

    beforeEach(() => {
        container = require("../../lib/container")(host);
        bluebird = container.resolve("bluebird");
        fsMock = jasmine.createSpyObj("fs", [
            "createWriteStream"
        ]);
        container.register("fs", fsMock);
        requestMock = require("../mock/request-mock")();
        requestMock.get.andReturn(requestMock);
        responseMock = require("../mock/response-mock")();
        container.register("request", requestMock);
        requestAsyncMock = jasmine.createSpy("requestAsync");
        container.register("requestAsync", requestAsyncMock);
        container.register("logger", require("../mock/logger-mock")());
        TokenRequest = container.resolve("TokenRequest");
        tr = new TokenRequest(accountId);
    });
    describe(".download", () => {
        it("successfully downloads content.", () => {
            var resp;

            resp = {
                body: "test",
                statusCode: 200
            };
            requestAsyncMock.andReturn(bluebird.resolve(resp));

            return tr.download(token).then((contents) => {
                expect(contents).toEqual(resp.body);
            });
        });
    });
    describe(".downloadToFile", () => {
        it("successfully downloads content to a fake file.", () => {
            var file, mockedStream, promise, StreamReadable;

            file = "test.js";
            StreamReadable = require("stream").Readable;
            mockedStream = new StreamReadable();
            responseMock.pipe.andReturn(mockedStream);
            fsMock.createWriteStream.andReturn({
                path: file
            });
            promise = tr.downloadToFile(token, file).then((actualFile) => {
                expect(actualFile).toEqual(file);
            });

            requestMock.emit("response", responseMock);
            mockedStream.emit("finish");

            return promise;
        });
    });
});
