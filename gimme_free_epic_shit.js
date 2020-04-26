"use strict";
const { "Launcher": EpicGames } = require("epicgames-client");
const { email, password, rememberLastSession } = require(`${__dirname}/config.json`);
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
    let getAllOffers = async(namespace, pagesize = 100) => {
        let i = 0;
        let results = [];
        while ((i * pagesize) - results.length === 0) {
            let { elements } = await client.getOffersForNamespace(namespace, pagesize, pagesize * i++);
            results = results.concat(elements);
        }
        return results;
    };

    const { data } = await client.http.sendGraphQL(null, `query searchStoreQuery($allowCountries: String, $category: String, $count: Int, $country: String!, $keywords: String, $locale: String, $namespace: String, $sortBy: String, $sortDir: String, $start: Int, $tag: String, $withPrice: Boolean = false, $withPromotions: Boolean = false) {
        Catalog {
          searchStore(allowCountries: $allowCountries, category: $category, count: $count, country: $country, keywords: $keywords, locale: $locale, namespace: $namespace, sortBy: $sortBy, sortDir: $sortDir, start: $start, tag: $tag) {
            elements {
              title
              id
              namespace
              description
              effectiveDate
              keyImages {
                type
                url
              }
              seller {
                id
                name
              }
              productSlug
              urlSlug
              url
              items {
                id
                namespace
              }
              customAttributes {
                key
                value
              }
              categories {
                path
              }
              price(country: $country) @include(if: $withPrice) {
                totalPrice {
                  discountPrice
                  originalPrice
                  voucherDiscount
                  discount
                  currencyCode
                  currencyInfo {
                    decimals
                  }
                  fmtPrice(locale: $locale) {
                    originalPrice
                    discountPrice
                    intermediatePrice
                  }
                }
                lineOffers {
                  appliedRules {
                    id
                    endDate
                    discountSetting {
                      discountType
                    }
                  }
                }
              }
              promotions(category: $category) @include(if: $withPromotions) {
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
                upcomingPromotionalOffers {
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
            paging {
              count
              total
            }
          }
        }
      }`, { "category": "freegames", "sortBy": "effectiveDate", "sortDir": "asc", "count": 1000, "locale": "en-US", "country": "NL", "withPrice": true, "withPromotions": false });
    console.dir(JSON.parse(data));

    let freeoffers = JSON.parse(data).data.Catalog.searchStore.elements.filter(o => o.price.totalPrice.discountPrice === 0 && new Date(o.effectiveDate).valueOf() < Date.now());

    for (let offer of freeoffers) {
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
