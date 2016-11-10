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
    Uri: "urijs",
    hasha: "hasha",
    StreamConcat: "stream-concat"
};

// All modules that a factories (create an object).
// This is how we write most of our code.
factoryDefs = {
    AuthorizationBuilder: "./authorization-builder",
    logger: "./logger",
    promisifier: "./promisifier",
    requestHandler: "./request-handler",
    SignedTokenRequest: "./signed-token-request",
    signer: "./signer",
    ContentHasher: "./content-hasher"
};

Dizzy = require("dizzy");

module.exports = (host, logLevel) => {
    var container;

    // Defaulting logLevel.
    if (typeof logLevel === "undefined") {
        logLevel = "info";
    }

    container = new Dizzy();
    container.register("container", container).asValue();
    container.register("host", host).asValue();
    container.register("logLevel", logLevel).asValue();
    container.register("StreamReadable", require("stream").Readable).asValue();

    Object.keys(moduleDefs).forEach((moduleKey) => {
        container.register(moduleKey, moduleDefs[moduleKey]).fromModule();
    });
    Object.keys(factoryDefs).forEach((moduleKey) => {
        // I mark it as cached, so we will get the same object every time. Remember that sometimes
        // we create a Class, in which case you can use that class to create instances of that object.
        container.register(moduleKey, factoryDefs[moduleKey]).fromModule(__dirname).asFactory().cached();
    });
    [
        "fs",
        "request"
    ].forEach((moduleName) => {
        container.register(`${moduleName}Async`, "promisifier").fromContainer().asFactory(moduleName).cached();
    });

    return container;
};
