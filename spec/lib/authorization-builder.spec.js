"use strict";

describe("AuthoriztionBuilder", () => {
    var AuthorizationBuilder, container, dateMock, loggerMock;

    beforeEach(() => {
        loggerMock = require("../mock/logger-mock")();
        dateMock = jasmine.createSpyObj("date", [
            "now"
        ]);
        dateMock.now.and.returnValue("NOW");
        container = require("../../lib/container")("api.opentoken.io");
        container.register("dateService", dateMock);
        container.register("logger", loggerMock);
        AuthorizationBuilder = container.resolve("AuthorizationBuilder");
    });
    describe(".createHeader", () => {
        var body, code, expectedAuth, requestOptions, secret, signature;

        beforeEach(() => {
            code = "code";
            secret = "secret";
            body = "hello world";
            signature = "49c0edb8558bee14649dc77da6ab934a23477261549dd377f19206f85a56785b";
            requestOptions = {
                body,
                headers: {
                    "content-type": "text/plain",
                    "x-opentoken-date": "NOW",
                    host: "api.opentoken.io"
                },
                method: "POST",
                url: "https://api.opentoken.io/account/abc123/token?public"
            };
            expectedAuth = `OT1-HMAC-SHA256-HEX; access-code=code; signed-headers=content-type x-opentoken-date host; signature=${signature}`;
        });
        it("will use a body that is a string", () => {
            var auth, builder;

            builder = new AuthorizationBuilder(code, secret, requestOptions, body);

            auth = builder.createHeader();
            expect(auth).toEqual(expectedAuth);
        });
        it("will use a body that is a Buffer", () => {
            var auth, builder;

            body = Buffer.from(body);
            requestOptions.body = body;
            builder = new AuthorizationBuilder(code, secret, requestOptions);

            auth = builder.createHeader();
            expect(auth).toEqual(expectedAuth);
        });
        it("will standardize header keys", () => {
            var auth, builder;

            requestOptions.headers = {
                "CoNtent-tYpe": "text/plain",
                "x-opEntOken-datE": "NOW",

                // host is a special case and is lowercased specifically.
                host: "Api.OPENtoken.io"
            };

            builder = new AuthorizationBuilder(code, secret, requestOptions, body);

            // Important to note: The fact that the "signed-headers" are not
            // cased the same as when they were used to build the signature
            // is OK. So long as they were lowercase when used to build
            // the signature we should be fine. Tested this with the actual
            // API and it appears to work no problem.
            expectedAuth = `OT1-HMAC-SHA256-HEX; access-code=code; signed-headers=CoNtent-tYpe x-opEntOken-datE host; signature=${signature}`;

            auth = builder.createHeader();
            expect(auth).toEqual(expectedAuth);
        });
        it("will debug log the result", () => {
            var auth, builder;

            builder = new AuthorizationBuilder(code, secret, requestOptions, body);

            auth = builder.createHeader();
            expect(loggerMock.debug).toHaveBeenCalledWith("Authorization header value:", auth);
        });
    });
});
