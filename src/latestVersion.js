"use strict";

const HTTPS = require("https");

// taken & modified from https://stackoverflow.com/a/38543075/8068153
function httpsRequest(params, postData) {
    return new Promise((res, rej) => {
        let req = HTTPS.request(params, (response) => {
            // reject on bad status
            if (response.statusCode < 200 || response.statusCode >= 300) {
                rej(new Error(`HTTP Error ${response.statusCode}`));
            }

            // cumulate data
            let body = [];
            response.on("data", (chunk) => {
                body.push(chunk);
            });

            // resolve on end
            response.on("end", () => {
                try {
                    body = JSON.parse(Buffer.concat(body).toString());
                    // Get latest release, remove "v" prefix.
                    return res(body[0].tag_name.substring(1));
                } catch (e) {
                    return rej(e);
                }
            });
        });

        // reject on request error
        req.on("error", (err) => {
            // This is not a "Second reject", just a different sort of failure
            rej(err);
        });

        // Sometimes github actions network will have hiccup...
        // https://github.com/Revadike/epicgames-freebies-claimer/issues/152
        req.on("timeout", () => {
            req.destroy();
            rej(new Error("Request timeout"));
        });

        if (postData) {
            req.write(postData);
        }

        // IMPORTANT
        req.end();
    });
}

function latestVersion() {
    return httpsRequest({
        "host":    "api.github.com",
        "path":    "/repos/Revadike/epicgames-freebies-claimer/releases",
        "method":  "GET",
        "headers": { "user-agent": "EFC" },
        "timeout": 3000,
    });
}

module.exports = { latestVersion };
