"use strict";
const ENDPOINT = {
    // eslint-disable-next-line max-len
    "CATALOG_ADDON":    "https://www.epicgames.com/graphql?operationName=getMappingByPageSlug&variables=%7B%22pageSlug%22:%22{{slug}}%22%7D&extensions=%7B%22persistedQuery%22:%7B%22version%22:1,%22sha256Hash%22:%225a08e9869c983776596498e0c4052c55f9e54c79e18a303cd5eb9a46be55c7d7%22%7D%7D",
    "CATALOG_PRODUCTS": "https://store-content.ak.epicgames.com/api/{{locale}}/content/products/{{slug}}",
    "CATALOG_BUNDLES":  "https://store-content.ak.epicgames.com/api/{{locale}}/content/bundles/{{slug}}",
    "FREE_GAMES":       "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions",
};

async function getAddonForSlug(client, slug) {
    let { error, response } = await client.http.sendEpicgamesRequest(
        false,
        "GET",
        URL.replace("{{slug}}", slug),
    );

    if (error) {
        throw error;
    }

    return response;
}

async function getBundleForSlug(client, slug, locale) {
    let { error, response } = await client.http.sendEpicgamesRequest(
        false,
        "GET",
        ENDPOINT.CATALOG_BUNDLES.replace("{{slug}}", slug).replace("{{locale}}", locale),
    );

    if (error) {
        throw error;
    }

    return response;
}

async function getProductForSlug(client, slug, locale) {
    let { error, response } = await client.http.sendEpicgamesRequest(
        false,
        "GET",
        ENDPOINT.CATALOG_PRODUCTS.replace("{{slug}}", slug).replace("{{locale}}", locale),
    );

    if (error) {
        throw error;
    }

    return response;
}

async function getOfferId(client, promo, locale = "en-US") {
    let id = null;
    let namespace = null;
    let slug = (promo.productSlug || promo.urlSlug).split("/")[0];
    let isBundle = (promo) => Boolean(promo.categories.find((cat) => cat.path === "bundles"));
    let isAddon = (promo) => promo.offerType === "EDITION" || Boolean(promo.categories.find((cat) => cat.path === "addons"));

    if (isAddon(promo)) {
        let result = await getAddonForSlug(client, slug, locale);
        id = result.data.StorePageMapping.mapping.mappings.offerId;
    } else if (isBundle(promo)) {
        let result = await getBundleForSlug(client, slug, locale);
        let page = result.pages ? result.pages.find((p) => p.offer.id === promo.id) || result.pages[0] : result;
        // eslint-disable-next-line prefer-destructuring
        id = page.offer.id;
        // eslint-disable-next-line prefer-destructuring
        namespace = page.offer.namespace;
    } else {
        let result = await getProductForSlug(client, slug, locale);
        let page = result.pages ? result.pages.find((p) => p.offer.id === promo.id) || result.pages[0] : result;
        // eslint-disable-next-line prefer-destructuring
        id = page.offer.id;
        // eslint-disable-next-line prefer-destructuring
        namespace = page.offer.namespace;
    }

    return { namespace, id };
}

async function freeGamesPromotions(client, country = "US", allowCountries = "US", locale = "en-US") {
    let { error, response } = await client.http.sendEpicgamesRequest(
        false,
        "GET",
        `${ENDPOINT.FREE_GAMES}?country=${country}&allowCountries=${allowCountries}&locale=${locale}`,
    );

    if (error) {
        throw error;
    }

    let { elements } = response.data.Catalog.searchStore;
    let free = elements.filter((offer) => offer.promotions
        && offer.promotions.promotionalOffers.length > 0
        && offer.promotions.promotionalOffers[0].promotionalOffers.find((p) => p.discountSetting.discountPercentage === 0));

    let freeOffers = await Promise.all(free.map(async(promo) => {
        let { title } = promo;
        let { namespace, id } = await getOfferId(client, promo, locale);
        namespace = namespace || promo.namespace;
        return { title, id, namespace };
    }));

    return freeOffers;
}

module.exports = { freeGamesPromotions };
