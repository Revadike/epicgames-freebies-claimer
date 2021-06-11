"use strict";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { freeGamesPromotions } = require("./src/gamePromotions");
const { purchaseOffer } = require("./src/purchaseOffer");
const { "Client": EpicGames } = require("fnbr");
const CheckUpdate = require("check-update-github");
const Config = require(`${__dirname}/config.json`);
const Logger = require("tracer").console(`${__dirname}/logger.js`);
const Package = require("./package.json");

let DeviceAuths = {};
try {
    DeviceAuths = require(`${__dirname}/device_auths.json`);
} catch (error) { /* No device_auths.json */ }
try {
    DeviceAuths = require(`${__dirname}/deviceAuths.json`);
} catch (error) { /* No deviceAuths.json */ }

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

function sleep(delay) {
    return new Promise((res) => setTimeout(res, delay * 60000));
}

(async() => {
    let { options, delay, loop } = Config;
    do {
        if (!await isUpToDate()) {
            Logger.warn(`There is a new version available: ${Package.url}`);
        }

        if (Object.keys(DeviceAuths).length === 0) {
            Logger.warn("You should first add an account!");
            Logger.warn("Run the following command:");
            Logger.warn("");
            Logger.warn("npm run account");
            process.exit(0);
        }

        for (let email in DeviceAuths) {
            let deviceAuth = DeviceAuths[email];
            let auth = { deviceAuth };
            let client = new EpicGames({ auth, ...options });

            await client.login();
            Logger.info(`Logged in as ${client.user.displayName} (${client.user.id})`);

            let { country } = client.user;
            let freePromos = await freeGamesPromotions(client, country, country);

            for (let offer of freePromos) {
                try {
                    let purchased = await purchaseOffer(client, offer);
                    if (purchased) {
                        Logger.info(`Successfully claimed ${offer.title} (${purchased})`);
                    } else {
                        Logger.info(`${offer.title} was already claimed for this account`);
                    }
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

            await client.logout();
            Logger.info(`Logged ${client.user.displayName} (${client.user.id}) out of Epic Games`);
        }

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
