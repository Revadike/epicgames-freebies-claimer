"use strict";
const Config = require(`${__dirname}/config.json`);
const Logger = require("tracer").console(`${__dirname}/logger.js`);
const ClientLoginAdapter = require("epicgames-client-login-adapter");
const twoFactor = require("node-2fa");
const { "Launcher": EpicGames } = require("epicgames-client");
const PROMO_QUERY = `query searchStoreQuery($category: String, $locale: String, $start: Int) {
    Catalog {
        searchStore(category: $category, locale: $locale, start: $start) {
            elements {
                title
                id
                namespace
                promotions(category: $category) {
                    promotionalOffers {
                        promotionalOffers {
                            startDate
                            endDate
                            discountSetting {
                                discountType
                                discountPercentage
                            }
                        }
                    }
                }
            }
        }
    }
}`;
(async() => {
    let { accounts, delay, loop } = Config;
    let sleep = delay => new Promise(res => setTimeout(res, delay * 60000));
    do {
        if (process.argv.length > 2) {
            loop = false;
            accounts = [{
                "email":               process.argv[2],
                "password":            process.argv[3],
                "rememberLastSession": Boolean(Number(process.argv[4]))
            }];
        }

        for (let account of accounts) {
            if (account.twoFactorSecret !== "") {
                let { token } = twoFactor.generateToken(account.twoFactorSecret);
                account.twoFactorCode = token;
            }
            if (account.twoFactorCode !== "") {
                Logger.info(`use 2fa code ${account.twoFactorCode} to login as ${account.email}`);
            }
            let client = new EpicGames(account);

            if (!await client.init()) {
                throw new Error("Error while initialize process.");
            }
            if (!await client.login().catch(() => false)) {
                Logger.warn(`Failed to login as ${client.config.email}, please attempt manually.`);
                if (account.twoFactorSecret !== "") {
                    let { token } = twoFactor.generateToken(account.twoFactorSecret);
                    account.twoFactorCode = token;
                }
                if (account.twoFactorCode !== "") {
                    Logger.info(`use 2fa code ${account.twoFactorCode} to login as ${account.email}`);
                }
                // generate new 2fa code but adapter not support 2fa code yet
                let auth = await ClientLoginAdapter.init(account);
                let exchangeCode = await auth.getExchangeCode();
                await auth.close();

                if (!await client.login(null, exchangeCode)) {
                    throw new Error("Error while logging in.");
                }
            }

            Logger.info(`Logged in as ${client.account.name} (${client.account.id})`);

            let { data } = await client.http.sendGraphQL(null, PROMO_QUERY, { "category": "freegames", "locale": "en-US" });
            let { elements } = JSON.parse(data).data.Catalog.searchStore;
            let freePromos = elements.filter(offer => offer.promotions
                && offer.promotions.promotionalOffers.length > 0
                && offer.promotions.promotionalOffers[0].promotionalOffers.find(p => p.discountSetting.discountPercentage === 0));

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
