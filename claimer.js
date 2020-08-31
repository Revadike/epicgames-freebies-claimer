"use strict";
const { "Launcher": EpicGames } = require("epicgames-client");
const CheckUpdate = require("check-update-github");
const ClientLoginAdapter = require("epicgames-client-login-adapter");
const Config = require(`${__dirname}/config.json`);
const Logger = require("tracer").console(`${__dirname}/logger.js`);
const Package = require("./package.json");
const TwoFactor = require("node-2fa");
const Cookie = require('tough-cookie').Cookie;

const { freeGamesPromotions } = require('./src/gamePromotions');

function isUpToDate() {
    return new Promise((res, rej) => {
        CheckUpdate({
            "name":           Package.name,
            "currentVersion": Package.version,
            "user":           "revadike",
            "branch":         "master"
        }, (err, latestVersion) => {
            if (err) {
                rej(err);
            } else {
                res(latestVersion === Package.version);
            }
        });
    });
}

function getChromeCookie(cookie) {
    cookie = Object.assign({}, cookie);
    cookie.name = cookie.key;
    if (cookie.expires instanceof Date) {
        cookie.expires = cookie.expires.getTime() / 1000.0;
    } else {
        delete cookie.expires;
    }
    return cookie;
}

function getToughCookie(cookie) {
    cookie = Object.assign({}, cookie);
    cookie.key = cookie.name;
    cookie.expires = new Date(cookie.expires * 1000);
    return new Cookie(cookie);
}

(async() => {
    if (!await isUpToDate()) {
        Logger.warn(`There is a new version available: ${Package.url}`);
    }

    let { accounts, options, delay, loop } = Config;
    if (!options) {
        options = {};
    }
    let sleep = delay => new Promise(res => setTimeout(res, delay * 60000));
    do {
        if (process.argv.length > 2) {
            loop = false;
            accounts = [{
                "email":               process.argv[2],
                "password":            process.argv[3],
                "rememberLastSession": Boolean(Number(process.argv[4])),
                "secret":              process.argv[5],
            }];
        }

        for (let account of accounts) {
            let noSecret = !account.secret || account.secret.length === 0;
            if (!noSecret) {
                let { token } = TwoFactor.generateToken(account.secret);
                account.twoFactorCode = token;
            }

            let epicOptions = Object.assign({}, options);
            Object.assign(epicOptions, account);

            let client = new EpicGames(epicOptions);

            if (!await client.init()) {
                throw new Error("Error while initialize process.");
            }

            let success = false;
            try {
                success = await client.login(account);
            } catch (error) {
                Logger.warn(error.message);
            }

            if (!success) {
                Logger.warn(`Failed to login as ${client.config.email}, please attempt manually.`);


                if (account.rememberLastSession) {
                    if (!options.cookies) {
                        options.cookies = [];
                    }
                    if (account.cookies && account.cookies.length) {
                        options.cookies = options.cookies.concat(account.cookies);
                    }
                    client.http.jar._jar.store.getAllCookies((err, cookies) => {
                        for (const cookie of cookies) {
                            options.cookies.push(getChromeCookie(cookie));
                        }
                    });
                }

                let auth = await ClientLoginAdapter.init(account, options);
                let exchangeCode = await auth.getExchangeCode();

                if (account.rememberLastSession) {
                    let cookies = await auth.getPage().then(p => p.cookies());
                    for (let cookie of cookies) {
                        cookie = getToughCookie(cookie);
                        client.http.jar.setCookie(cookie, "https://" + cookie.domain);
                    }
                }

                await auth.close();

                if (!await client.login(null, exchangeCode)) {
                    throw new Error("Error while logging in.");
                }
            }

            Logger.info(`Logged in as ${client.account.name} (${client.account.id})`);

            let { country } = client.account.country;
            let freePromos = await freeGamesPromotions(client, country, country);

            for (let offer of freePromos) {
                let launcherQuery = await client.launcherQuery(offer.namespace, offer.id);
                if (launcherQuery.data.Launcher.entitledOfferItems.entitledToAllItemsInOffer) {
                    Logger.info(`${offer.title} is already claimed for this account`);
                    continue;
                }

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
})().catch(err => {
    Logger.error(err);
    process.exit(1);
});
