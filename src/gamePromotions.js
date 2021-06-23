"use strict";

async function freeGamesPromotions(client, country = "US", allowCountries = "US", locale = "en-US") {
    let { data } = await client.freeGamesPromotions(country, allowCountries, locale);
    let { elements } = data.Catalog.searchStore;
    let free = elements.filter((offer) => offer.promotions
        && offer.promotions.promotionalOffers.length > 0
        && offer.promotions.promotionalOffers[0].promotionalOffers.find((p) => p.discountSetting.discountPercentage === 0));

    let isBundle = (promo) => Boolean(promo.categories.find((cat) => cat.path === "bundles"));
    // eslint-disable-next-line no-confusing-arrow
    let getOffer = (promo) => isBundle(promo)
        ? client.getBundleForSlug(promo.productSlug.split("/")[0], locale)
        : client.getProductForSlug(promo.productSlug.split("/")[0], locale);

    let freeOffers = await Promise.all(free.map(async(promo) => {
        let offer = await getOffer(promo);
        let page = offer;

        if (offer.pages) {
            page = offer.pages.find((p) => p.offer.id === promo.id);
        }

        if (!page) {
            [page] = offer.pages;
        }

        return {
            "title":     offer.productName || offer._title,
            "id":        page.offer.id,
            "namespace": page.offer.namespace,
        };
    }));

    return freeOffers;
}

module.exports = { freeGamesPromotions };
