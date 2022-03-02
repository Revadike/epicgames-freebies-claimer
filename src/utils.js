"use strict";
const FS = require("fs");
const { writeFileSync, existsSync, readFileSync, unlinkSync } = FS;
const { writeFile } = FS.promises;

function prepareData() {
    if (!existsSync("data/config.json")) {
        writeFileSync("data/config.json", readFileSync("data/config.example.json"));
    }
    if (!existsSync("data/history.json")) {
        writeFileSync("data/history.json", "{}");
    }
    if (!existsSync("data/deviceAuths.json")) {
        if (existsSync("data/device_auths.json")) {
            writeFileSync("data/deviceAuths.json", readFileSync("data/device_auths.json"));
            unlinkSync("data/device_auths.json");
        } else {
            writeFileSync("data/deviceAuths.json", "{}");
        }
    }
}

function sleep(delay) {
    return new Promise((res) => setTimeout(res, delay * 60000));
}

module.exports = { writeFile, prepareData, sleep };
