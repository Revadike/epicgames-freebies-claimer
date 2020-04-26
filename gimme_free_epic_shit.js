"use strict";
const { "Launcher": EpicGames } = require("epicgames-client");
const ClientLoginAdapter = require("epicgames-client-login-adapter");
const sleep = delay => new Promise(res => setTimeout(res, delay * 1000));

(async() => {
    let config = require(`${__dirname}/config.json`);
    do {
        try {
            for (let accountId in config.accounts) {
                let account = config.accounts[accountId];
                const credentials = {
                    "email":    process.argv[2] || account.email,
                    "password": process.argv[3] || account.password
                };
                if (typeof process.argv[4] === "undefined") {
                    credentials.rememberLastSession = account.rememberLastSession;
                } else {
                    credentials.rememberLastSession = Boolean(Number(process.argv[4]));
                }
                let client = new EpicGames(credentials);

                if (!await client.init()) {
                    throw new Error("Error while initialize process.");
                }

                if (!await client.login().catch(() => false)) {
                    console.log(`Failed to login as ${client.config.email}, please attempt manually.`);
                    let auth = await ClientLoginAdapter.init(credentials);
                    let exchangeCode = await auth.getExchangeCode();
                    await auth.close();

                    if (!await client.login(null, exchangeCode)) {
                        throw new Error("Error while logging in.");
                    }
                }

                console.log(`Logged in as ${client.account.name} (${client.account.id})`);
                let getAllOffers = async(namespace, pagesize = 100) => {
                    let i = 0;
                    let results = [];
                    while ((i * pagesize) - results.length === 0) {
                        let { elements } = await client.getOffersForNamespace(namespace, pagesize, pagesize * i++);
                        results = results.concat(elements);
                    }
                    return results;
                };

                let all = await getAllOffers("epic");
                let freegames = all
                    .filter(game => game.categories.find(cat => cat.path === "freegames")
                        && game.customAttributes["com.epicgames.app.offerNs"].value)
                    .map(game => game.customAttributes["com.epicgames.app.offerNs"].value);

                for (let namespace of freegames) {
                    let offers = await getAllOffers(namespace);
                    let freeoffers = offers.filter(game => game.currentPrice === 0 && game.discountPercentage === 0);

                    for (let offer of freeoffers) {
                        let purchased = await client.purchase(offer, 1);

                        if (purchased) {
                            console.log(`Successfully claimed ${offer.title} (${purchased})`);
                        } else {
                            console.log(`${offer.title} was already claimed for this account`);
                        }
                    }
                }

                await client.logout();
                console.log(`Logged out of Epic Games (account ${client.account.name})`);
                console.log(`Wait ${config.delay} seconds`);
                await sleep(config.delay);
            }
        } catch (e) {
            console.error(e);
            console.log(`Wait ${config.delay} seconds`);
            await sleep(config.delay);
        }
        process.exit(0);
    }
    while (config.loop);
})().catch(err => {
    console.error(err);
    process.exit(-1);
});
