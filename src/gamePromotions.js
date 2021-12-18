"use strict";

async function getAddonForSlug(client, slug) {
    // eslint-disable-next-line max-len
    const URL = "https://www.epicgames.com/graphql?operationName=getMappingByPageSlug&variables=%7B%22pageSlug%22:%22{{slug}}%22%7D&extensions=%7B%22persistedQuery%22:%7B%22version%22:1,%22sha256Hash%22:%225a08e9869c983776596498e0c4052c55f9e54c79e18a303cd5eb9a46be55c7d7%22%7D%7D";

    try {
        const { data } = await client.http.sendGet(
            URL.replace("{{slug}}", slug),
        );

        return data;
    } catch (err) {
        client.debug.print(new Error(err));
    }

    return false;
}

async function getOfferId(client, promo, locale = "en-US") {
    let id = null;
    let namespace = null;
    let slug = (promo.productSlug || promo.urlSlug).split("/")[0];
    let isBundle = (promo) => Boolean(promo.categories.find((cat) => cat.path === "bundles"));
    let isAddon = (promo) => promo.offerType === "EDITION" || Boolean(promo.categories.find((cat) => cat.path === "addons"));

    if (isAddon(promo)) {
        let result = await getAddonForSlug(client, slug, locale);
        // eslint-disable-next-line prefer-destructuring
        id = result.data.StorePageMapping.mapping.mappings.offerId;
    } else if (isBundle(promo)) {
        let result = await client.getBundleForSlug(slug, locale);
        let page = result.pages ? result.pages.find((p) => p.offer.id === promo.id) || result.pages[0] : result;
        // eslint-disable-next-line prefer-destructuring
        id = page.offer.id;
        // eslint-disable-next-line prefer-destructuring
        namespace = page.offer.namespace;
    } else {
        let result = await client.getProductForSlug(slug, locale);
        let page = result.pages ? result.pages.find((p) => p.offer.id === promo.id) || result.pages[0] : result;
        // eslint-disable-next-line prefer-destructuring
        id = page.offer.id;
        // eslint-disable-next-line prefer-destructuring
        namespace = page.offer.namespace;
    }

    return { namespace, id };
}

async function freeGamesPromotions(client, country = "US", allowCountries = "US", locale = "en-US") {
    let { data } = await client.freeGamesPromotions(country, allowCountries, locale);
    let { elements } = data.Catalog.searchStore;
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
