"use strict";

describe("TokenRequest", () => {
    var bluebird, container, fsMock, requestAsyncMock, requestMock, responseMock, StreamReadable, TokenRequest, tr, utils;

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
        requestAsyncMock = jasmine.createSpy("request");
        responseMock = require("../mock/response-mock")();
        container.register("requestAsync", requestAsyncMock);
        container.register("logger", require("../mock/logger-mock")());
        TokenRequest = container.resolve("TokenRequest");
        tr = new TokenRequest(accountId);
        StreamReadable = require("stream").Readable;
        utils = require("../helper/utils")(StreamReadable);
    });
    describe(".downloadAsync", () => {
        it("successfully downloads content.", () => {
            var resp;

            resp = {
                body: "test",
                statusCode: 200
            };
            requestAsyncMock.andReturn(bluebird.resolve(resp));

            return tr.downloadAsync(token).then((contents) => {
                expect(contents).toEqual(resp.body);
            });
        });
    });
    describe(".downloadToFileAsync", () => {
        it("successfully downloads content to a fake file.", () => {
            var file, mockedStream, promise;

            requestAsyncMock.get = jasmine.createSpy("request.get").andReturn(requestMock);
            file = "test.js";
            mockedStream = utils.createStream();
            responseMock.pipe.andReturn(mockedStream);
            fsMock.createWriteStream.andReturn({
                path: file
            });
            promise = tr.downloadToFileAsync(token, file).then((actualFile) => {
                expect(actualFile).toEqual(file);
            });

            requestMock.emit("response", responseMock);
            mockedStream.emit("finish");

            return promise;
        });
    });
});
