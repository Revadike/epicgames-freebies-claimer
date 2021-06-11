"use strict";
const colors = require("colors");
const fs = require("fs");
const path = require("path");

module.exports = {
    "format":     " {{timestamp}} | {{title}} | {{message}}",
    "dateformat": "yyyy-mm-dd | HH:MM:ss.l",
    "filters":    {
        "log":   colors.white,
        "trace": colors.magenta,
        "debug": colors.blue,
        "info":  colors.green,
        "warn":  colors.magenta,
        "error": [colors.red, colors.bold],
    },
    "preprocess": (data) => {
        data.title = data.title.toUpperCase();
        while (data.title.length < 5) { data.title += " "; }
        data.args = [...data.args];
        if (data.args[0] && data.args[0].logpath) {
            data.logpath = data.args[0].logpath;
            data.args.shift();
        }
    },
    "transport": (data) => {
        // eslint-disable-next-line no-console
        console.log(data.output);

        const streamoptions = {
            "flags":    "a",
            "encoding": "utf8",
        };
        fs.createWriteStream(path.join(__dirname, "claimer.log"), streamoptions).write(`\r\n${data.rawoutput}`);
        if (data.logpath) {
            fs.createWriteStream(data.logpath, streamoptions).write(`\r\n${data.rawoutput}`);
        }
    },
};
