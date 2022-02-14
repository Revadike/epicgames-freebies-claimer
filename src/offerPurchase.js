"use strict";

const ENDPOINT = {
    "CHECKOUT": "https://www.epicgames.com/store/purchase",
    "PURCHASE": "https://payment-website-pci.ol.epicgames.com/purchase",
};

async function getPurchaseToken(client, offer) {
    let { error, response } = await client.http.sendEpicgamesRequest(
        true,
        "GET",
        // eslint-disable-next-line max-len
        `${ENDPOINT.CHECKOUT}?offers=1-${offer.namespace}-${offer.id}&orderId&purchaseToken&showNavigation=true`,
        "launcher",
    );

    if (error) {
        throw error;
    }

    let token = response.match(/(?<=id="purchaseToken" value=")([0-9a-f]+)(?=")/g);
    if (!token) {
        throw new Error("Unable to acquire purchase token");
    }

    return token[0];
}

async function purchaseOrderPreview(client, offer, token) {
    let { error, response } = await client.http.sendEpicgamesRequest(
        false,
        "POST",
        `${ENDPOINT.PURCHASE}/order-preview`,
        "launcher",
        { "x-requested-with": token },
        {
            "useDefault":    true,
            "setDefault":    false,
            "namespace":     offer.namespace,
            "country":       null,
            "countryName":   null,
            "orderId":       null,
            "orderComplete": null,
            "orderError":    null,
            "orderPending":  null,
            "offers":        [offer.id],
            "offerPrice":    "",
        },
    );

    if (response.orderResponse && response.orderResponse.error) {
        throw new Error(response.orderResponse.message);
    }

    if (error) {
        throw error;
    }

    if (!response.syncToken) {
        throw new Error("Unable to acquire sync token");
    }

    return response;
}

async function purchaseOrderConfirm(client, order, token) {
    let { error, response } = await client.http.sendEpicgamesRequest(
        false,
        "POST",
        `${ENDPOINT.PURCHASE}/confirm-order`,
        "launcher",
        { "x-requested-with": token },
        {
            "useDefault":            true,
            "setDefault":            false,
            "namespace":             order.namespace,
            "country":               order.country,
            "countryName":           order.countryName,
            "orderId":               null,
            "orderComplete":         null,
            "orderError":            null,
            "orderPending":          null,
            "offers":                order.offers,
            "includeAccountBalance": false,
            "totalAmount":           order.orderResponse.totalPrice,
            "affiliateId":           "",
            "creatorSource":         "",
            "syncToken":             order.syncToken,
        },
    );
    if (response && response.error) {
        throw new Error(response.message || response.error || response);
    }
    if (error) {
        error.response = response;
        throw new Error(`Cannot confirm order (${error})`);
    }
    return response && response.confirmation;
}

async function offerPurchase(client, offer) {
    let token = await getPurchaseToken(client, offer);
    let order = await purchaseOrderPreview(client, offer, token);
    return purchaseOrderConfirm(client, order, token);
}

module.exports = { offerPurchase };
