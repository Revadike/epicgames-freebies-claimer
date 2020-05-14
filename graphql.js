"use strict";
module.exports = `query searchStoreQuery($category: String, $locale: String, $start: Int) {
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
