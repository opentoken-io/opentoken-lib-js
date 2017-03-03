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
        requestAsyncMock = jasmine.createSpy("request");
        responseMock = require("../mock/response-mock")();
        container.register("requestAsync", requestAsyncMock);
        container.register("logger", require("../mock/logger-mock")());
        TokenRequest = container.resolve("TokenRequest");
        tr = new TokenRequest(accountId);
    });
    describe(".downloadAsync", () => {
        it("successfully downloads content.", () => {
            var resp;

            resp = {
                body: "test",
                statusCode: 200
            };
            requestAsyncMock.and.returnValue(bluebird.resolve(resp));

            return tr.downloadAsync(token).then((contents) => {
                expect(contents).toEqual(resp.body);
            });
        });
    });
    describe(".downloadToFileAsync", () => {
        it("successfully downloads content to a fake file.", () => {
            var file, mockedStream, promise;

            requestAsyncMock.get = jasmine.createSpy("request.get").and.returnValue(requestMock);
            file = "test.js";
            mockedStream = jasmine.createStream();
            responseMock.pipe.and.returnValue(mockedStream);
            fsMock.createWriteStream.and.returnValue({
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
