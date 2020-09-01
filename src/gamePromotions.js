
async function freeGamesPromotions(client, country = "US", allowCountries = "US", locale = "en-US") {
    let { data } = await client.freeGamesPromotions(country, allowCountries, locale);
    let { elements } = data.Catalog.searchStore;
    let free = elements.filter(offer => offer.promotions
    && offer.promotions.promotionalOffers.length > 0
    && offer.promotions.promotionalOffers[0].promotionalOffers.find(p => p.discountSetting.discountPercentage === 0));
    let isBundle = promo => Boolean(promo.categories.find(cat => cat.path === "bundles"));
    let getOffer = promo => (isBundle(promo)
    ? client.getBundleForSlug(promo.productSlug.split('/')[0], locale)
    : client.getProductForSlug(promo.productSlug.split('/')[0], locale));

    let freeOffers = await Promise.all(free.map(async promo => {
        let o = await getOffer(promo);
        let page;
        if (o.pages) {
            page = o.pages.find(p => p._urlPattern.includes(promo.productSlug));
        } else {
            page = o;
        }
        if (!page) {
            [page] = o.pages;
        }

        return {
            "title":     o.productName || o._title,
            "id":        page.offer.id,
            "namespace": page.offer.namespace
        }
    }));

    return freeOffers;
}

module.exports = { freeGamesPromotions };
