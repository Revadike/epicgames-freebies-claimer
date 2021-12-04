"use strict";

const https = require("https");

// taken & modified from https://stackoverflow.com/a/38543075/8068153
function httpsRequest(params, postData) {
    return new Promise((resolve, reject) => {
        let req = https.request(params, (res) => {
            // reject on bad status
            if (res.statusCode < 200 || res.statusCode >= 300) {
                reject(new Error(`statusCode=${res.statusCode}`));
            }
            // cumulate data
            let body = [];
            res.on("data", (chunk) => {
                body.push(chunk);
            });
            // resolve on end
            res.on("end", () => {
                try {
                    body = JSON.parse(Buffer.concat(body).toString());
                    // Get latest release, remove "v" prefix.
                    return resolve(body[0].tag_name.substring(1));
                } catch (e) {
                    return reject(e);
                }
            });
        });
        // reject on request error
        req.on("error", (err) => {
            // This is not a "Second reject", just a different sort of failure
            reject(err);
        });
        // Sometimes github actions network will have hiccup...
        // https://github.com/Revadike/epicgames-freebies-claimer/issues/152
        req.on("timeout", () => {
            req.destroy();
            reject(new Error("Request timeout"));
        });
        if (postData) {
            req.write(postData);
        }
        // IMPORTANT
        req.end();
    });
}

module.exports = function latestRelease() {
    let options = {
        "host":    "api.github.com",
        "path":    "/repos/Revadike/epicgames-freebies-claimer/releases",
        "method":  "GET",
        "headers": { "user-agent": "EFC" },
        "timeout": 3000,

    };
    return httpsRequest(options);
};
