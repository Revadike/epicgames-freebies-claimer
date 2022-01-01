"use strict";

const { writeFile, writeFileSync, existsSync, readFileSync } = require("fs");
if (!existsSync(`${__dirname}/data/config.json`)) {
    writeFileSync(`${__dirname}/data/config.json`, readFileSync(`${__dirname}/data/config.example.json`));
}
if (!existsSync(`${__dirname}/data/history.json`)) {
    writeFileSync(`${__dirname}/data/history.json`, "{}");
}

const { "Launcher": EpicGames } = require("epicgames-client");
const { freeGamesPromotions } = require(`${__dirname}/src/gamePromotions`);
const { latestVersion } = require(`${__dirname}/src/latestVersion.js`);
const Auths = require(`${__dirname}/data/device_auths.json`);
const Config = require(`${__dirname}/data/config.json`);
const Fork = require("child_process");
const History = require(`${__dirname}/data/history.json`);
const Logger = require("tracer").console(`${__dirname}/logger.js`);
const Package = require(`${__dirname}/package.json`);

function appriseNotify(appriseUrl, notificationMessages) {
    if (!appriseUrl || notificationMessages.length === 0) {
        return;
    }

    let notification = notificationMessages.join("\n");
    try {
        let s = Fork.spawnSync("apprise", [
            "-vv",
            "-t",
            `Epicgames Freebies Claimer ${Package.version}`,
            "-b",
            notification,
            appriseUrl,
        ]);

        let output = s.stdout ? s.stdout.toString() : "ERROR: Maybe apprise not found?";
        if (output && output.includes("ERROR")) {
            Logger.error(`Failed to send push notification (${output})`);
        } else if (output) {
            Logger.info("Push notification sent");
        } else {
            Logger.warn("No output from apprise");
        }
    } catch (err) {
        Logger.error(`Failed to send push notification (${err})`);
    }
}

function write(path, data) {
    // eslint-disable-next-line no-extra-parens
    return new Promise((res, rej) => writeFile(path, data, (err) => (err ? rej(err) : res(true))));
}

function sleep(delay) {
    return new Promise((res) => setTimeout(res, delay * 60000));
}

(async() => {
    let { options, delay, loop, appriseUrl, notifyIfNoUnclaimedFreebies } = Config;

    do {
        Logger.info(`Epicgames Freebies Claimer (${Package.version}) by ${Package.author.name || Package.author}`);

        let latest = await latestVersion().catch((err) => {
            Logger.error(`Failed to check for updates (${err})`);
        });

        if (latest && latest !== Package.version) {
            Logger.warn(`There is a new release available (${latest}): ${Package.url}`);
        }

        let notificationMessages = [];
        for (let email in Auths) {
            let { country } = Auths[email];
            let claimedPromos = History[email] || [];
            let newlyClaimedPromos = [];
            let useDeviceAuth = true;
            let rememberDevicesPath = `${__dirname}/data/device_auths.json`;
            let clientOptions = { email, ...options, rememberDevicesPath };
            let client = new EpicGames(clientOptions);

            if (!await client.init()) {
                let errMess = "Error while initialize process.";
                notificationMessages.push(errMess);
                Logger.error(errMess);
                break;
            }

            // Check before logging in
            let freePromos = await freeGamesPromotions(client, country, country);
            let unclaimedPromos = freePromos.filter((offer) => !claimedPromos.find(
                (_offer) => _offer.id === offer.id && _offer.namespace === offer.namespace,
            ));

            Logger.info(`Found ${unclaimedPromos.length} unclaimed freebie(s) for ${email}`);
            if (unclaimedPromos.length === 0) {
                if (notifyIfNoUnclaimedFreebies) {
                    notificationMessages.push(`${email} has no unclaimed freebies`);
                }
                continue;
            }

            let success = await client.login({ useDeviceAuth }).catch(() => false);
            if (!success) {
                let errMess = `Failed to login as ${email}`;
                notificationMessages.push(errMess);
                Logger.error(errMess);
                continue;
            }

            Logger.info(`Logged in as ${client.account.name} (${client.account.id})`);
            Auths[email].country = client.account.country;
            write(rememberDevicesPath, JSON.stringify(Auths, null, 4)).catch(() => false); // ignore fails

            for (let offer of unclaimedPromos) {
                try {
                    let purchased = await client.purchase(offer, 1);
                    if (purchased) {
                        Logger.info(`Successfully claimed ${offer.title} (${purchased})`);
                        newlyClaimedPromos.push(offer.title);
                    } else {
                        Logger.warn(`${offer.title} was already claimed for this account`);
                    }
                    // Also remember already claimed offers
                    offer.date = Date.now();
                    claimedPromos.push(offer);
                } catch (err) {
                    notificationMessages.push(`${email} failed to claim ${offer.title}`);
                    Logger.error(`Failed to claim ${offer.title} (${err})`);
                    if (err.response
                        && err.response.body
                        && err.response.body.errorCode === "errors.com.epicgames.purchase.purchase.captcha.challenge") {
                        // It's pointless to try next one as we'll be asked for captcha again.
                        let errMess = "Aborting! Captcha detected.";
                        notificationMessages.push(errMess);
                        Logger.error(errMess);
                        break;
                    }
                }
            }

            History[email] = claimedPromos;

            // Setting up notification message for current account
            if (newlyClaimedPromos.length > 0) {
                notificationMessages.push(`${email} claimed ${newlyClaimedPromos.length} freebies: ${
                    newlyClaimedPromos.join(", ")}`);
            } else {
                notificationMessages.push(`${email} has claimed 0 freebies`);
            }

            await client.logout();
            Logger.info(`Logged ${client.account.name} out of Epic Games`);
        }
        appriseNotify(appriseUrl, notificationMessages);

        await write(`${__dirname}/data/history.json`, JSON.stringify(History, null, 4));
        if (loop) {
            Logger.info(`Waiting ${delay} minutes`);
            await sleep(delay);
        } else {
            process.exit(0);
        }
    } while (loop);
})().catch((err) => {
    Logger.error(err);
    process.exit(1);
});
