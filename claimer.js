"use strict";

const { "Launcher": EpicGames } = require("epicgames-client");
const { freeGamesPromotions } = require("./src/gamePromotions");

const Auths = require(`${__dirname}/device_auths.json`);
const CheckUpdate = require("check-update-github");
const Config = require(`${__dirname}/config.json`);
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

function sleep(delay) {
    return new Promise((res) => setTimeout(res, delay * 60000));
}

(async() => {
    if (!await isUpToDate()) {
        Logger.warn(`There is a new version available: ${Package.url}`);
    }

    let { options, delay, loop } = Config;
    do {
        for (let email in Auths) {
            let useDeviceAuth = true;
            let clientOptions = { email, ...options };
            let client = new EpicGames(clientOptions);
            if (!await client.init()) {
                throw new Error("Error while initialize process.");
            }

            let success = await client.login({ useDeviceAuth });
            if (!success) {
                throw new Error(`Failed to login as ${client.config.email}`);
            }

            Logger.info(`Logged in as ${client.account.name} (${client.account.id})`);

            let { country } = client.account;
            let freePromos = await freeGamesPromotions(client, country, country);

            for (let offer of freePromos) {
                try {
                    let purchased = await client.purchase(offer, 1);
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
            Logger.info(`Logged ${client.account.name} out of Epic Games`);
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
