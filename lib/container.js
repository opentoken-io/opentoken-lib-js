"use strict";

var Dizzy, factoryDefs, moduleDefs;

// We want to provide the entire module as the dependency.
moduleDefs = {
    bluebird: "bluebird",
    parseLinkHeader: "parse-link-header",
    requests: "requests",
    URI: "urijs"
};

// All modules that a factories (create an object).
// This is how we write most of our code.
factoryDefs = {
    AuthorizationBuilder: "./authorization-builder"
};

Dizzy = require("dizzy");

module.export = (host) => {
    var container;

    container = new Dizzy();
    container.register("container", container).asValue();
    container.register("host", host).asValue();

    Object.keys(moduleDefs).forEach((moduleKey) => {
        container.register(moduleKey, moduleDefs[moduleKey]).fromModule();
    });

    Object.keys(factoryDefs).forEach((moduleKey) => {
        // I mark it as cached, so we will get the same object every time. Remember that sometimes
        // we create a Class, in which case you can use that class to create instances of that object.
        container.register(moduleKey, moduleDefs[moduleKey]).fromModule(__dirname).asFactory().cached();
    });
};
