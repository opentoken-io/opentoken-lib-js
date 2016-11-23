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

    // Upload content to public endpoint. Takes a stream or file name.
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

### `OpentokenLib(host)`

Creates an instance of `OpentokenLib`.

### `opentokenLib.createSignedTokenRequests(accountId, code, secret)`

Creates an instance of `SignedTokenRequests`.

### `opentokenLib.createTokenRequest(accountId)`

Creates an instance of `TokenRequest`.

### `signedTokenRequests.private`

Property is an instance of `SignedTokenRequest`. Uploads content to private endpoints that require a signed request to retrieve through `SignedTokenRequest`.

### `signedTokenRequests.public`

Property is an instance of `SignedTokenRequest` with `isPublic` set to true. This property is used as part of the query string in the request to OpenToken. It ensure content uploaded is retrievable with an unsigned request through `TokenRequest`.


### `SignedTokenRequest`

Performs all signed token requests to OpenToken.

### `signedTokenRequest.uploadAsync(token, contents)`

Uploads content to OpenToken.

### `signedTokenRequest.uploadFromFileAsync(token, filePath)`

Uploads content to OpenToken from a file. It either takes a path or stream.

### `signedTokenRequest.downloadAsync(token)`

Downloads content from OpenToken. Using signed requests for downloading is only required for public endpoints.

### `signedTokenRequest.downloadToFileAsync(token, filePath)`

Downloads content from OpenToken piping the body of the request directly to a file or stream.

### `TokenRequest`

Performs all unsigned token requests to OpenToken.

### `tokenRequest.downloadAsync(token)`

Downloads public content from OpenToken.

### `tokenRequest.downloadToFileAsync(token, filePath)`

Downloads public content from OpenToken piping the body of the request directly to a file or stream.
