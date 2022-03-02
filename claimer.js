"use strict";

const { writeFile, prepareData, sleep } = require(`${__dirname}/src/utils`);
prepareData();

const { "Client": EpicGames } = require("fnbr");
const { appriseNotify } = require(`${__dirname}/src/appriseNotify`);
const { freeGamesPromotions } = require(`${__dirname}/src/gamePromotions`);
const { offerPurchase } = require(`${__dirname}/src/offerPurchase.js`);
const AutoGitUpdate = require("auto-git-update");
const Config = require(`${__dirname}/data/config.json`);
const DeviceAuths = require(`${__dirname}/data/deviceAuths.json`);
const History = require(`${__dirname}/data/history.json`);
const Logger = require("tracer").console(`${__dirname}/logger.js`);
const OS = require("os");
const Package = require(`${__dirname}/package.json`);

(async() => {
    let {
        appriseUrl,
        autoUpdate,
        delay,
        loop,
        notifyIfNoUnclaimedFreebies,
        options,
    } = Config;
    let updater = new AutoGitUpdate({
        "executeOnComplete": "npm start",
        "exitOnComplete":    true,
        "fromReleases":      true,
        "logConfig":         {
            "logGeneral": false,
            "logWarning": false,
            "logError":   false,
        },
        "repository":   Package.url,
        "tempLocation": OS.tmpdir(),
    });

    if (process.env.EFC_DISABLE_AUTO_UPDATE) {
        autoUpdate = false;
    } else if (autoUpdate !== false) {
        autoUpdate = true;
    }

    do {
        Logger.info(`Epicgames Freebies Claimer (${Package.version}) by ${Package.author.name || Package.author}`);

        if (autoUpdate) {
            await updater.autoUpdate();
        }

        if (Object.keys(DeviceAuths).length === 0) {
            Logger.warn("You should first add an account!");
            Logger.warn("Run the following command:");
            Logger.warn("");
            Logger.warn("npm run account");
            process.exit(0);
        }

        let notificationMessages = [];
        for (let email in DeviceAuths) {
            let { country } = DeviceAuths[email];
            let claimedPromos = History[email] || [];
            let newlyClaimedPromos = [];
            let checkEULA = true;
            let createLauncherSession = true;
            let deviceAuth = DeviceAuths[email];
            let auth = { deviceAuth, checkEULA, createLauncherSession };
            let clientOptions = {
                ...options,
                auth,
                "createParty":   false,
                "connectToXMPP": false,
                "fetchFriends":  false,
            };
            let client = new EpicGames(clientOptions);

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

            let err = await client.login().catch((err) => err);
            if (err) {
                err = `Failed to login as ${email}: ${err}`;
                notificationMessages.push(err);
                Logger.error(err);
                continue;
            }

            Logger.info(`Logged in as ${client.user.displayName} (${client.user.id})`);
            DeviceAuths[email].country = client.user.country;
            await writeFile(`${__dirname}/data/deviceAuths.json`, JSON.stringify(DeviceAuths, null, 4));

            for (let offer of unclaimedPromos) {
                try {
                    let purchased = await offerPurchase(client, offer);
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
                        let err = "Aborting! Captcha detected.";
                        notificationMessages.push(err);
                        Logger.error(err);
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
            Logger.info(`Logged ${client.user.displayName} out of Epic Games`);
        }
        appriseNotify(appriseUrl, notificationMessages, Logger);

        await writeFile(`${__dirname}/data/history.json`, JSON.stringify(History, null, 4));
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
