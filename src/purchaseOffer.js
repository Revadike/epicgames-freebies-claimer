"use strict";
const Tokens = require("fnbr/resources/Tokens");
const ENDPOINT = {
    "PORTAL_ORIGIN": "https://ue-launcher-website-prod.ol.epicgames.com",
    "PURCHASE":      "https://payment-website-pci.ol.epicgames.com/purchase",
};
let Auth = {};

async function auth(client) {
    let { success, response } = await client.Auth.getOauthToken("client_credentials", {}, Tokens.LAUNCHER_WINDOWS);
    if (!success) {
        throw new Error("Failed to get auth bearer");
    }

    Auth = response;
}

async function newPurchase(client, offer) {
    let { success, response } = await client.Http.send(
        true,
        "GET",
        `${ENDPOINT.PORTAL_ORIGIN}/purchase?showNavigation=true&namespace=${offer.namespace}&offers=${offer.id}`,
        `${Auth.token_type} ${Auth.access_token}}`,
    );

    if (!success) {
        return false;
    }

    const token = response.match(/(?<=id="purchaseToken" value=")[0-9a-z]+(?=")/g);

    if (!token) {
        return false;
    }

    return token[0];
}

async function purchaseOrderPreview(client, token, offer) {
    let formData = {
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
    };

    let { success, response } = await client.Http.send(
        false,
        "POST",
        `${ENDPOINT.PURCHASE}/order-preview`,
        `${Auth.token_type} ${Auth.access_token}}`,
        {
            "Content-Type":     "application/x-www-form-urlencoded",
            "x-requested-with": token,
        },
        null,
        formData,
    );

    if (!success) {
        throw new Error("Order preview failed");
    }

    if (response.orderResponse && response.orderResponse.error) {
        throw new Error(response.orderResponse.message);
    }

    return response.syncToken ? response : false;
}

async function purchaseOrderConfirm(client, token, order) {
    let formData = {
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
    };

    let { success, response } = await client.Http.send(
        false,
        "POST",
        `${ENDPOINT.PURCHASE}/confirm-order`,
        `${Auth.token_type} ${Auth.access_token}}`,
        {
            "Content-Type":     "application/x-www-form-urlencoded",
            "x-requested-with": token,
        },
        null,
        formData,
    );

    if (!success) {
        throw new Error("Order confirm failed");
    }

    return response && response.confirmation;
}

async function purchaseOffer(client, offer) {
    await auth(client);
    const token = await newPurchase(client, offer);
    if (!token) {
        throw new Error("Unable to acquire purchase token");
    }
    const order = await purchaseOrderPreview(client, token, offer);
    if (!order) { return false; }
    return purchaseOrderConfirm(client, token, order);
}

module.exports = { purchaseOffer };
