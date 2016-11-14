OpenToken Library
=================

A library to interact with the [OpenToken API](https://github.com/opentoken-io/opentoken).


Usage
-----

The library exposes two functions `createSignedTokenRequests` and `createTokenRequest`. Let's go through an example of a common use case for token requests.

    // Instantiate the library.
    var lib = require("opentoken-lib")("api.opentoken.io");

    // Create signedTokenRequests.
    var signedTokenRequests = lib.createSignedTokenRequests("accountId", "openTokenCode", "secretCode");

    // Create tokenRequest for downloading public content. OpenToken code and secret are not required.
    var tokenRequest = lib.createTokenRequest("accountId");

    // Upload content to public endpoint. Takes a stream or file name.
    signedTokenRequests.public.uploadFromFile("keep-me-safe.txt").then((token) => {
        // Upload the public token to a private endpoint.
        return signedTokenRequests.private.upload(token);
    }).then((token) => {
        // Grab public token from private endpoint.
        return signedTokenRequests.private.download(token);
    }).then((content) => {
        // Public content can also be downloaded with the signedTokenRequests. Takes a stream or file name.
        return tokenRequest.downloadToFile(token, "output.txt");
    })

SignedTokenRequest
------------------

`createSignedTokenRequests` returns an object containing two properties `public` and `private`. Each of these properties are instances of `SignedTokenRequest`, meant to be used with public and private endpoints. It exposes four functions `download`, `downloadToFile`, `upload`, and `uploadToFile`.


TokenRequest
------------

Provides an interface for unsigned token requests. `createTokenRequest` returns an instance of `TokenRequest`. It exposes two functions `download` and `downloadToFile`.
