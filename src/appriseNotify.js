"use strict";
const Fork = require("child_process");

function appriseNotify(appriseUrl, notificationMessages, logger = console) {
    if (!appriseUrl || notificationMessages.length === 0) {
        return;
    }

    let notification = notificationMessages.join("\n");
    try {
        let s = Fork.spawnSync("apprise", [
            "-vv",
            "-t",
            "Epicgames Freebies Claimer",
            "-b",
            notification,
            appriseUrl,
        ]);

        let output = s.stdout ? s.stdout.toString() : "ERROR: Maybe apprise not found?";
        if (output && output.includes("ERROR")) {
            logger.error(`Failed to send push notification (${output})`);
        } else if (output) {
            logger.info("Push notification sent");
        } else {
            logger.warn("No output from apprise");
        }
    } catch (err) {
        logger.error(`Failed to send push notification (${err})`);
    }
}

module.exports = { appriseNotify };
