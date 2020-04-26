"use strict";
const { "Launcher": EpicGames } = require("epicgames-client");
const { email, password, rememberLastSession } = require(`${__dirname}/config.json`);
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
const credentials = {
    "email":    process.argv[2] || email,
    "password": process.argv[3] || password
};

if (typeof process.argv[4] === "undefined") {
    credentials.rememberLastSession = rememberLastSession;
} else {
    credentials.rememberLastSession = Boolean(Number(process.argv[4]));
}

(async() => {
    const client = new EpicGames(credentials);

    if (!await client.init()) {
        throw new Error("Error while initialize process.");
    }

    if (!await client.login().catch(() => false)) {
        console.log(`Failed to login as ${client.config.email}, please attempt manually.`);

        const ClientLoginAdapter = require("epicgames-client-login-adapter");
        let auth = await ClientLoginAdapter.init(credentials);
        let exchangeCode = await auth.getExchangeCode();
        await auth.close();

        if (!await client.login(null, exchangeCode)) {
            throw new Error("Error while logging in.");
        }
    }

    console.log(`Logged in as ${client.account.name} (${client.account.id})`);

    const { data } = await client.http.sendGraphQL(null, PROMO_QUERY, { "category": "freegames", "locale": "en-US" });

    let { elements } = JSON.parse(data).data.Catalog.searchStore;
    let freePromos = elements.filter(offer => offer.promotions
      && offer.promotions.promotionalOffers.length > 0
      && offer.promotions.promotionalOffers[0].promotionalOffers.find(p => p.discountSetting.discountPercentage === 0));

    for (let offer of freePromos) {
        try {
            let purchased = await client.purchase(offer, 1);
            if (purchased) {
                console.log(`Successfully claimed ${offer.title} (${purchased})`);
            } else {
                console.log(`${offer.title} was already claimed for this account`);
            }
        } catch (error) {
            console.log(`Failed to claim ${offer.title} (${error})`);
        }
    }

    await client.logout();
    console.log("Logged out of Epic Games");
    process.exit(0);
})().catch(err => {
    console.error(err);
    process.exit(1);
});
