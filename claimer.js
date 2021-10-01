"use strict";

const { "Launcher": EpicGames } = require("epicgames-client");
const { freeGamesPromotions } = require("./src/gamePromotions");
const { writeFile } = require("fs");

const Auths = require(`${__dirname}/data/device_auths.json`);
const CheckUpdate = require("check-update-github");
const Config = require(`${__dirname}/data/config.json`);
const History = require(`${__dirname}/data/history.json`);
const Logger = require("tracer").console(`${__dirname}/logger.js`);
const Package = require("./package.json");

function isUpToDate() {
    return new Promise((res, rej) => {
        CheckUpdate({
            "name":           Package.name,
            "currentVersion": Package.version,
            "user":           "revadike",
            "branch":         "master",
        }, (err, latestVersion) => {
            if (err) {
                rej(err);
            } else {
                res(latestVersion === Package.version);
            }
        });
    });
}

function write(path, data) {
    // eslint-disable-next-line no-extra-parens
    return new Promise((res, rej) => writeFile(path, data, (err) => (err ? rej(err) : res(true))));
}

function sleep(delay) {
    return new Promise((res) => setTimeout(res, delay * 60000));
}

(async() => {
    let { options, delay, loop, pushbulletApiKey } = Config;

    let pusher = null;
    if (pushbulletApiKey) {
        try {
            const PushBullet = require("pushbullet");
            pusher = new PushBullet(pushbulletApiKey);
        } catch (err) {
            Logger.error("Package 'pushbullet' is not installed, but 'pushbulletApiKey' was set in config");
        }
    }

    do {
        if (!await isUpToDate()) {
            Logger.warn(`There is a new version available: ${Package.url}`);
        }

        for (let email in Auths) {
            let { country } = Auths[email];
            let claimedPromos = History[email] || [];
            let newlyClaimedPromos = [];
            let useDeviceAuth = true;
            let rememberDevicesPath = `${__dirname}/data/device_auths.json`;
            let clientOptions = { email, ...options, rememberDevicesPath };
            let client = new EpicGames(clientOptions);
            if (!await client.init()) {
                Logger.error("Error while initialize process.");
                break;
            }

            // Check before logging in
            let freePromos = await freeGamesPromotions(client, country, country);
            let unclaimedPromos = freePromos.filter((offer) => !claimedPromos.find(
                (_offer) => _offer.id === offer.id && _offer.namespace === offer.namespace,
            ));

            Logger.info(`Found ${unclaimedPromos.length} unclaimed freebie(s) for ${email}`);
            if (unclaimedPromos.length === 0) {
                continue;
            }

            let success = await client.login({ useDeviceAuth }).catch(() => false);
            if (!success) {
                Logger.error(`Failed to login as ${client.config.email}`);
                continue;
            }

            Logger.info(`Logged in as ${client.account.name} (${client.account.id})`);
            Auths[email].country = client.account.country;
            write(`${__dirname}/device_auths.json`, JSON.stringify(Auths, null, 4)).catch(() => false); // ignore fails

            for (let offer of unclaimedPromos) {
                try {
                    let purchased = await client.purchase(offer, 1);
                    if (purchased) {
                        Logger.info(`Successfully claimed ${offer.title} (${purchased})`);
                        newlyClaimedPromos.push(offer);
                    } else {
                        Logger.warn(`${offer.title} was already claimed for this account`);
                    }
                    // Also remember already claimed offers
                    offer.date = Date.now();
                    claimedPromos.push(offer);
                } catch (err) {
                    Logger.warn(`Failed to claim ${offer.title} (${err})`);
                    if (err.response
                        && err.response.body
                        && err.response.body.errorCode === "errors.com.epicgames.purchase.purchase.captcha.challenge") {
                        // It's pointless to try next one as we'll be asked for captcha again.
                        Logger.error("Aborting!");
                        break;
                    }
                }
            }

            History[email] = claimedPromos;
            if (pusher && newlyClaimedPromos.length > 0) {
                let notification = newlyClaimedPromos.map((promo) => promo.title).join(", ");
                try {
                    await pusher.note({}, "New freebies claimed on Epic Games Store", notification);
                    Logger.info("Push notification sent");
                } catch (err) {
                    Logger.error(`Failed to send push notification (${err})`);
                }
            }

            await client.logout();
            Logger.info(`Logged ${client.account.name} out of Epic Games`);
        }

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
