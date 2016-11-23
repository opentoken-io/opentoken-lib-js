OpenToken Library
=================

A library to interact with the [OpenToken API](https://github.com/opentoken-io/opentoken).


Examples
--------

### Token Requests

    // Instantiate the library.
    var lib = require("opentoken-lib")("api.opentoken.io");

    // Create signedTokenRequests.
    var signedTokenRequests = lib.createSignedTokenRequests("accountId", "openTokenCode", "secretCode");

    // Create tokenRequest for downloading public content. OpenToken code and secret are not required.
    var tokenRequest = lib.createTokenRequest("accountId");

    // Upload content to public endpoint. Takes a file path.
    signedTokenRequests.public.uploadFromFileAsync("keep-me-safe.txt").then((token) => {
        // Upload the public token to a private endpoint.
        return signedTokenRequests.private.uploadAsync(token);
    }).then((token) => {
        // Grab public token from private endpoint.
        return signedTokenRequests.private.downloadAsync(token);
    }).then((content) => {
        // Public content can also be downloaded with the signedTokenRequests. Takes a stream or file name.
        return tokenRequest.downloadToFileAsync(token, "output.txt");
    });


API
---

### `OpentokenLib({string} host)`

Creates an instance of `OpentokenLib`.

    // Instantiate the library.
    var lib = require("opentoken-lib")("api.opentoken.io");


### `{opentoken-lib-js~SignedTokenRequests} opentokenLib.createSignedTokenRequests({string} accountId, {string} codeString, {string} secret)`

Creates an instance of `SignedTokenRequests`.

    // Create signedTokenRequests.
    var signedTokenRequests = lib.createSignedTokenRequests("accountId", "openTokenCode", "secretCode");

### `signedTokenRequests.private`

Property is an instance of `SignedTokenRequest`. Uploads content to private endpoints that require a signed request to retrieve through `SignedTokenRequest`.

    // Upload content to a private endpoint.
    signedTokenRequests.private.uploadAsync(token).then((token) => {
        console.log(token);
    });

### `signedTokenRequests.public`

Property is an instance of `SignedTokenRequest` with `isPublic` set to true. This property is used as part of the query string in the request to OpenToken. It ensure content uploaded is retrievable with an unsigned request through `TokenRequest`.

    // Upload content to public endpoint from a file.
    signedTokenRequests.public.uploadFromFileAsync("keep-me-safe.txt").then((token) => {
        console.log(token);
    });

### `opentokenLib.createTokenRequest(accountId)`

Creates an instance of `TokenRequest`.

    // Create tokenRequest for downloading public content. OpenToken code and secret are not required.
    var tokenRequest = lib.createTokenRequest("accountId");

### `SignedTokenRequest`

Performs all signed token requests to OpenToken.

### `{Promise.<string>} signedTokenRequest.uploadAsync({Buffer} contents)`

Uploads content to OpenToken.

    signedTokenRequests.public.uploadAsync(buffer).then((token) => {
        console.log(token);
    });

### `{Promise.<string>} signedTokenRequest.uploadFromFileAsync({string} filePath)`

Uploads content to OpenToken from a file. It either takes a path or stream.

    signedTokenRequests.public.uploadFromFileAsync("file.txt").then((token) => {
        console.log(token);
    });

### `{Promise.<Buffer>} signedTokenRequest.downloadAsync({string} token)`

Downloads content from OpenToken. Using signed requests for downloading is only required for public endpoints.

    signedTokenRequests.public.downloadAsync("MYTOKEN").then((content) => {
        console.log(content.toString());
    });

### `{Promise.<string>} signedTokenRequest.downloadToFileAsync({string} token, {string} filePath)`

Downloads content from OpenToken piping the body of the request directly to a file or stream. It returns the path of the file the data is output to.

    signedTokenRequests.public.downloadToFileAsync("MYTOKEN", "path-to-file.txt").then((fileName) => {
        console.log(fileName);
    });

### `TokenRequest`

Performs all unsigned token requests to OpenToken.

### `{Promise.<Buffer>} tokenRequest.downloadAsync({string} token)`

Downloads public content from OpenToken.

    tokenRequest.downloadAsync("MYTOKEN").then((content) => {
        console.log(content.toString());
    });

### `{Promise.<string>} tokenRequest.downloadToFileAsync({string} token, {string} filePath)`

Downloads public content from OpenToken piping the body of the request directly to a file or stream.

    tokenRequest.downloadToFileAsync("MYTOKEN", "path-to-file.txt").then((fileName) => {
        console.log(fileName);
    });

