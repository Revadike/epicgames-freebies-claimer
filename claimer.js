"use strict";
const request = require("request");
const Config = require(`${__dirname}/config.json`);
const Logger = require("tracer").console(`${__dirname}/logger.js`);
const Package = require(`${__dirname}/package.json`);
const ClientLoginAdapter = require("epicgames-client-login-adapter");
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

function isNewerVersion(currentVersion, remoteVersion) {
    if (currentVersion && currentVersion !== "" && remoteVersion && remoteVersion !== "") {
        Logger.info(`Current version is ${currentVersion} and remote version is ${remoteVersion}`);
        let current = currentVersion.split(".");
        let remote = remoteVersion.split(".");
        for (let i = 0; i < (current.length > remote.length ? current.length : remote.length); ++i) {
            let i1 = i < current.length ? parseInt(current[i]) : 0;
            let i2 = i < remote.length ? parseInt(remote[i]) : 0;
            if (i1 !== i2) {
                return !(i1 > i2);
            }
        }
        return false;
    }

    Logger.error("Version is empty value");
    return false;
}

function GetJSON(options) {
    return new Promise((resolve, reject) => {
        request(options, (err, res, body) => {
            if (err) {
                reject(err);
                return;
            }

            if (res.statusCode !== 200) {
                reject(new Error(`Invalid Status Code: ${res.statusCode}`));
                return;
            }

            let json = "{}";
            try {
                json = JSON.parse(body);
            } catch (err) { Logger.error(err); }

            if (!json) {
                reject(body);
                return;
            }

            resolve(json);
        });
    });
}

function GetLatestVersion() {
    return new Promise(async(resolve, reject) => {
        let remotePackage = "https://raw.githubusercontent.com/Revadike/epicgames-freebies-claimer/master/package.json";
        let json = await GetJSON(remotePackage).catch(err => { reject(err); });

        if (!json || !json.version) {
            reject(json);
            return;
        }

        resolve(json.version);
    });
}
(async() => {
    Logger.info("Checking update");
    let remoteVersion = await GetLatestVersion().catch(err => { Logger.error(err); });
    if (isNewerVersion(Package.version, remoteVersion)) {
        Logger.warn("Found newer version on github!");
    } else {
        Logger.info("There is no newer version on github!");
    }
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
            let client = new EpicGames(account);

            if (!await client.init()) {
                throw new Error("Error while initialize process.");
            }

            if (!await client.login().catch(() => false)) {
                Logger.warn(`Failed to login as ${client.config.email}, please attempt manually.`);
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
