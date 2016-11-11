"use strict";

describe("AuthoriztionBuilder", () => {
    var AuthorizationBuilder, container, dateMock, StreamReadable;

    beforeEach(() => {
        dateMock = jasmine.createSpyObj("date", ["now"]);
        dateMock.now.andReturn("NOW");
        container = require("../../lib/container")("api.opentoken.io");
        container.register("dateService", dateMock);
        AuthorizationBuilder = container.resolve("AuthorizationBuilder");
        StreamReadable = container.resolve("StreamReadable");
    });

    describe(".createHeader", () => {
        var body, code, expectedAuth, requestOptions, secret;

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

        code = "code";
        secret = "secret";
        body = "hello world";
        requestOptions = {
            headers: {
                "content-type": "text/plain",
                "x-opentoken-date": "NOW",
                host: "api.opentoken.io"
            },
            method: "POST",
            url: "https://api.opentoken.io/account/abc123/token?public"
        };
        expectedAuth = "OT1-HMAC-SHA256-HEX; access-code=code; signed-headers=content-type x-opentoken-date host; signature=49c0edb8558bee14649dc77da6ab934a23477261549dd377f19206f85a56785b";
        it("will use a body that is a string", () => {
            var builder;

            builder = new AuthorizationBuilder(code, secret, requestOptions, body);

            return builder.createHeader().then((auth) => {
                expect(auth).toEqual(expectedAuth);
            });
        });

        it("will use a body that is a readable stream", () => {
            var builder;

            body = createStream(body);
            builder = new AuthorizationBuilder(code, secret, requestOptions, body);

            return builder.createHeader().then((auth) => {
                expect(auth).toEqual(expectedAuth);
            });
        });
    });
});
