"use strict";
const { Launcher: EpicGames } = require("epicgames-client");
const CheckUpdate = require("check-update-github");
const ClientLoginAdapter = require("epicgames-client-login-adapter");
const Config = require(`${__dirname}/config.json`);
const Logger = require("tracer").console(`${__dirname}/logger.js`);
const Package = require("./package.json");
const PROMO_QUERY = require(`${__dirname}/graphql.js`);
const TwoFactor = require("node-2fa");

function isUpToDate() {
    return new Promise((res, rej) => {
        CheckUpdate(
            {
                name: Package.name,
                currentVersion: Package.version,
                user: "revadike",
                branch: "master",
            },
            (err, latestVersion) => {
                if (err) {
                    rej(err);
                } else {
                    res(latestVersion === Package.version);
                }
            }
        );
    });
}

(async () => {
    if (!(await isUpToDate())) {
        Logger.warn(`There is a new version available: ${Package.url}`);
    }

    let { accounts, delay, loop } = Config;
    let sleep = (delay) => new Promise((res) => setTimeout(res, delay * 60000));
    do {
        if (process.argv.length > 2) {
            loop = false;
            accounts = [
                {
                    email: process.argv[2],
                    password: process.argv[3],
                    rememberLastSession: Boolean(Number(process.argv[4])),
                    secret: process.argv[5],
                },
            ];
        }

        for (let account of accounts) {
            let noSecret = !account.secret || account.secret.length === 0;
            if (!noSecret) {
                let { token } = TwoFactor.generateToken(account.secret);
                account.twoFactorCode = token;
            }

            let client = new EpicGames(account);

            if (!(await client.init())) {
                throw new Error("Error while initialize process.");
            }

            if (!(await client.login().catch(() => false))) {
                Logger.warn(
                    `Failed to login as ${client.config.email}, please attempt manually.`
                );

                let auth = await ClientLoginAdapter.init(account);
                let exchangeCode = await auth.getExchangeCode();
                await auth.close();

                if (!(await client.login(null, exchangeCode))) {
                    throw new Error("Error while logging in.");
                }
            }

            Logger.info(
                `Logged in as ${client.account.name} (${client.account.id})`
            );

            if (noSecret) {
                await client.enableTwoFactor("authenticator", (secret) => {
                    account.secret = secret;
                });
            }

            let { data } = await client.http.sendGraphQL(null, PROMO_QUERY, {
                category: "freegames",
                locale: "en-US",
            });
            let { elements } = JSON.parse(data).data.Catalog.searchStore;
            let freePromos = elements.filter(
                (offer) =>
                    offer.promotions &&
                    offer.promotions.promotionalOffers.length > 0 &&
                    offer.promotions.promotionalOffers[0].promotionalOffers.find(
                        (p) => p.discountSetting.discountPercentage === 0
                    )
            );

            for (let offer of freePromos) {
                try {
                    let purchased = await client.purchase(offer, 1);
                    if (purchased) {
                        Logger.info(
                            `Successfully claimed ${offer.title} (${purchased})`
                        );
                    } else {
                        Logger.info(
                            `${offer.title} was already claimed for this account`
                        );
                    }
                } catch (err) {
                    Logger.warn(`Failed to claim ${offer.title} (${err})`);
                }
            }

            if (noSecret) {
                await client.disableTwoFactor("authenticator");
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
