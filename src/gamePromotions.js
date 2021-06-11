"use strict";
const ENDPOINT = {
    "FREE_GAMES":       "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions",
    "CATALOG_PRODUCTS": "https://store-content.ak.epicgames.com/api/{{locale}}/content/products/{{slug}}",
    "CATALOG_BUNDLES":  "https://store-content.ak.epicgames.com/api/{{locale}}/content/bundles/{{slug}}",
};

async function freeGamesPromotions(client, country = "US", allowCountries = "US", locale = "en-US") {
    let { success, response } = await client.Http.send(
        false,
        "GET",
        `${ENDPOINT.FREE_GAMES}?country=${country}&allowCountries=${allowCountries}&locale=${locale}`,
    );

    if (!success) {
        throw new Error(response);
    }

    let { elements } = response.data.Catalog.searchStore;
    let free = elements.filter((offer) => offer.promotions
        && offer.promotions.promotionalOffers.length > 0
        && offer.promotions.promotionalOffers[0].promotionalOffers.find((p) => p.discountSetting.discountPercentage === 0));

    let isBundle = (promo) => Boolean(promo.categories.find((cat) => cat.path === "bundles"));
    let freeOffers = await Promise.all(free.map(async(promo) => {
        let slug = promo.productSlug.split("/")[0];
        let offer = null;
        if (isBundle(promo)) {
            offer = await client.Http.send(
                false,
                "GET",
                ENDPOINT.CATALOG_BUNDLES.replace("{{slug}}", slug).replace("{{locale}}", locale),
            );
        } else {
            offer = await client.Http.send(
                false,
                "GET",
                ENDPOINT.CATALOG_PRODUCTS.replace("{{slug}}", slug).replace("{{locale}}", locale),
            );
        }
        let { success, response } = offer;
        if (!success) {
            throw new Error("Unable to get details from slug");
        }

        let page = response;
        if (response.pages) {
            page = response.pages.find((p) => p._urlPattern.includes(promo.productSlug));
        }

        if (!page) {
            [page] = response.pages;
        }

        return {
            "title":     response.productName || response._title,
            "id":        page.offer.id,
            "namespace": page.offer.namespace,
        };
    }));

    return freeOffers;
}

module.exports = { freeGamesPromotions };
