"use strict";

var events;

events = require("events");

module.exports = () => {
    var eventEmitter, request;

    request = jasmine.createSpyObj("request", [
        "contentType",
        "get",
        "getContentLength",
        "getPath",
        "getQuery",
        "href",
        "isChunked",
        "post"
    ]);
    request.body = null;
    request.contentType.and.returnValue(null);
    request.getContentLength.and.callFake(() => {
        return request.internalContentLength;
    });
    request.getPath.and.callFake(() => {
        return request.internalPath;
    });
    request.getQuery.and.callFake(() => {
        return request.internalQuery;
    });
    request.headers = [];
    request.href.and.callFake(() => {
        return request.internalPath;
    });
    request.isChunked.and.callFake(() => {
        return false;
    });
    request.method = "GET";
    request.params = {};

    // These things are only used by the mock
    request.internalContentLength = 0;
    request.internalPath = "/path";
    request.internalQuery = "";

    // Custom additions to the standard Restify request object
    request.cookies = {};

    // Inherit methods from EventEmitter to get "on", "emit", "once", etc.
    eventEmitter = new events.EventEmitter();
    [
        "emit",
        "on",
        "once"
    ].forEach((methodName) => {
        request[methodName] = eventEmitter[methodName].bind(eventEmitter);
        spyOn(request, methodName).and.callThrough();
    });
    request.resume = jasmine.createSpy("request.resume");

    return request;
};
