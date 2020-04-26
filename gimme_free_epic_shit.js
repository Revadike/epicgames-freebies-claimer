"use strict";
const ClientLoginAdapter = require("epicgames-client-login-adapter");
const { "Launcher": EpicGames } = require("epicgames-client");
let { accounts, delay, loop } = require(`${__dirname}/config.json`);

(async() => {
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
                console.log(`Failed to login as ${client.config.email}, please attempt manually.`);
                let auth = await ClientLoginAdapter.init(account);
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
            console.log(`Logged ${client.account.name} out of Epic Games`);
        }

        if (loop) {
            console.log(`Waiting ${delay} minutes`);
            await sleep(delay);
        } else {
            process.exit(0);
        }
    } while (loop);
})().catch(err => {
    console.error(err);
    process.exit(1);
});
