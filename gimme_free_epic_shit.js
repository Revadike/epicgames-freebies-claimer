"use strict";
const { "Launcher": EpicGames } = require("epicgames-client");
const async = require("async");
const sleep = (delay) => new Promise((res, rej) => setTimeout(res, delay * 1000));

(async() => {
	do {
		try {
			var config = require(`${__dirname}/config.json`);
			for (var accountId in config.accounts) {
				var account = config.accounts[accountId];
				const credentials = {
					"email":    process.argv[2] || account.email,
					"password": process.argv[3] || account.password
				};
				if (typeof process.argv[4] === "undefined") {
					credentials.rememberLastSession = config.rememberLastSession;
				} else {
					credentials.rememberLastSession = Boolean(Number(process.argv[4]));
				}
				console.log(`Wait ${config.delay} seconds`);
				await sleep(config.delay);
				console.log(`Start to login email ${account.email}`);
				var client = new EpicGames(credentials);

				if (!await client.init()) {
					throw new Error("Error while initialize process.");
				}

				if (!await client.login().catch(() => false)) {
					console.log(`Failed to login as ${client.config.email}, please attempt manually.`);

					var ClientLoginAdapter = require("epicgames-client-login-adapter");
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
			}
		}
		catch(e) {
			console.error(e);
		}
	}
	while(config.loop);
})().catch(err => {
	console.error(err);
});
