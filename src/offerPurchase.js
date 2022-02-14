"use strict";
const { solveCaptcha } = require("puppeteer-hcaptcha");

const ENDPOINT = {
    "INIT":     "https://talon-service-prod.ecosec.on.epicgames.com/v1/init",
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

async function getCaptchaToken(client) {
    let { error, response } = await client.http.sendEpicgamesRequest(
        false,
        "POST",
        ENDPOINT.INIT,
        "launcher", // Auth not needed?
        {},
        { "flow_id": "checkout_free_prod" },
    );

    if (error) {
        throw error;
    }

    if (!response?.session?.plan?.h_captcha?.site_key) {
        throw new Error("Malformed response");
    }

    let captchaResponse = null;
    while (!captchaResponse) { // retry until we get a valid captcha token (unreliable)
        captchaResponse = await solveCaptcha(response.session.plan.h_captcha.site_key, "www.epicgames.com").catch(() => null);
    }
    // TODO: add paid service fallback

    return Buffer.from(JSON.stringify({
        "session_wrapper": response,
        "plan_results":    {
            "h_captcha": {
                // "value": "P0_eyJ0e.......gVwCHk",
                "resp_key": captchaResponse,
            },
        },
        "v": 1,
        // "xal": "107e09.....a7a25",
        // "ewa": "b",
        // "kid": "avp91q",
    })).toString("base64");
}

async function purchaseOrderConfirm(client, order, token) {
    let captchaToken = await getCaptchaToken(client);
    let { error, response } = await client.http.sendEpicgamesRequest(
        false,
        "POST",
        `${ENDPOINT.PURCHASE}/confirm-order`,
        "launcher",
        { "x-requested-with": token },

        // Old formdata syntax

        // {
        //     "affiliateId":           "",
        //     captchaToken,
        //     "country":               order.country,
        //     "countryName":           order.countryName,
        //     "creatorSource":         "",
        //     "includeAccountBalance": false,
        //     "namespace":             order.namespace,
        //     "offers":                order.offers,
        //     "orderComplete":         null,
        //     "orderError":            null,
        //     "orderId":               null,
        //     "orderPending":          null,
        //     "setDefault":            false,
        //     "syncToken":             order.syncToken,
        //     "totalAmount":           order.orderResponse.totalPrice,
        //     "useDefault":            true,
        // },

        // New formdata syntax

        {
            "eulaId":     null,
            "country":    order.country,
            "offers":     null,
            "lineOffers": [
                {
                    "appliedNsOfferIds": [],
                    "namespace":         order.namespace,
                    "offerId":           order.offers[0],
                    "quantity":          1,
                    "title":             "Windbound", // TODO: get title from offer
                    "upgradePathId":     null,
                },
            ],
            "totalAmount":      0,
            "setDefault":       false,
            "syncToken":        order.syncToken,
            "canQuickPurchase": true,
            "locale":           "en_US", // TODO: get locale from offer
            "affiliateId":      "",
            "creatorSource":    "",
            captchaToken,
        },
    );
    if (response && response.error) {
        throw new Error(response.message || response.error || response);
    }
    if (error) {
        error.response = response;
        // console.log({ error, response });
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
