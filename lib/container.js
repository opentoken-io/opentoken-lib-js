"use strict";

var Dizzy, factoryDefs, moduleDefs;

// We want to provide the entire module as the dependency.
moduleDefs = {
    bluebird: "bluebird",
    crypto: "crypto",
    fs: "fs",
    Log: "log",
    parseLinkHeader: "parse-link-header",
    request: "request",
    Uri: "urijs"
};

// All modules that are factories (create an object).
// This is how we write most of our code.
factoryDefs = {
    AuthorizationBuilder: "./authorization-builder",
    dateService: "./date-service",
    logger: "./logger",
    promisifier: "./promisifier",
    requestHandler: "./request-handler",
    SignedTokenRequest: "./signed-token-request",
    signer: "./signer",
    tokenDownloader: "./token-downloader",
    TokenRequest: "./token-request"
};

Dizzy = require("dizzy");

module.exports = (host, libraryOptions) => {
    var container;

    if (!libraryOptions) {
        libraryOptions = {};
    }

    // Defaulting logLevel.
    if (!libraryOptions.logLevel) {
        libraryOptions.logLevel = "info";
    }

    container = new Dizzy();
    container.registerBulk({
        container,
        host,
        libraryOptions,
        StreamReadable: require("stream").Readable,
        StreamPassThrough: require("stream").PassThrough
    }).asValue();

    // These are cached, so we get the same object every time. Remember that sometimes
    // we create a Class, in which case you can use that class to create instances of that object.
    container.registerBulk(factoryDefs).fromModule(__dirname).asFactory().cached();
    container.registerBulk(moduleDefs).fromModule();
    container.register("fsAsync", "promisifier").fromContainer().asFactory("fs").cached();
    container.register("requestAsync", "promisifier").fromContainer().asFactory("request").cached();

    return container;
};
