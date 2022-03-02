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

function createXal() {
    const hashkey = Buffer.from("a1xvnzZFEsVWfE2Yc9G/wMK/H1jVxqa92DCQlqW8NFA", "base64").toString("binary");
    /* eslint-disable */
    const fingerprintString = JSON.stringify({
        "fingerprint_version": 20,
        "timestamp":           new Date().toISOString(),
        "math_rand":           Math.floor(Math.pow(10, 16) * Math.random()).toString(16),
        "document":            { "title": "Payment by Epic Games" },
        "navigator":           {
            "user_agent":           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.87 Safari/537.36",
            "platform":             "Win32",
            "language":             "en-US",
            "languages":            ["en-US"],
            "hardware_concurrency": 7,
            "device_memory":        0.5,
            "product":              "Gecko",
            "product_sub":          "20030107",
            "vendor":               "Google Inc.",
            "vendor_sub":           "",
            "webdriver":            false,
            "max_touch_points":     0,
            "cookie_enabled":       true,
            "property_list":        [
                "sayswho",
                "brave",
                "globalPrivacyControl",
                "pdfViewerEnabled",
                "webdriver",
                "bluetooth",
                "clipboard",
                "credentials",
                "keyboard",
                "managed",
                "mediaDevices",
                "storage",
                "serviceWorker",
                "wakeLock",
                "deviceMemory",
                "ink",
                "hid",
                "locks",
                "presentation",
                "virtualKeyboard",
                "usb",
                "xr",
                "userAgentData",
                "canShare",
                "share",
                "clearAppBadge",
                "setAppBadge",
                "getInstalledRelatedApps",
                "getUserMedia",
                "requestMIDIAccess",
                "requestMediaKeySystemAccess",
                "webkitGetUserMedia",
                "registerProtocolHandler",
                "unregisterProtocolHandler",
            ],
        },
        "web_gl": {
            "canvas_fingerprint": {
                "length":     32246,
                "num_colors": 4369,
                "md5":        "",
                // "md5":        "21cc55ec...34da4",
            },
            "parameters": {
                "renderer": "ANGLE",
                "vendor":   "Google Inc. (NVIDIA)",
            },
        },
        "window": {
            "location": {
                "origin":   "https://www.epicgames.com",
                "pathname": "/store/purchase",
                "href":     "https://www.epicgames.com/store/purchase?highlightColor=0078f2&offers=1-a47cb01bef994749ac731aa3366796e8-13e70cb21eda428dbdf8d8b0a013880f&orderId&purchaseToken&showNavigation=true#/purchase/payment-methods",
            },
            "history": { "length": 5 },
            "screen":  {
                "avail_height": 1392,
                "avail_width":  2560,
                "avail_top":    0,
                "height":       1440,
                "width":        2560,
                "color_depth":  30,
            },
            "performance": {
                "memory": {
                    "js_heap_size_limit": 4294705152,
                    "total_js_heap_size": 180723698,
                    "used_js_heap_size":  170651762,
                },
                "resources": [
                    "https://static-assets-prod.epicgames.com/payment-web/static/assets/webpack/purchase.epic-web-purchase-node-ccadebe31847c0371bf134c4adda5919.css",
                    "https://static-assets-prod.epicgames.com/payment-web/static/assets/logo-epic-2de7f988e4229d74524cbe146a320be7.png",
                    "https://static-assets-prod.epicgames.com/payment-web/static/assets/loading-spin-d714262a31d74d08acc91ad627a53dc8.svg",
                    "https://songbird.cardinalcommerce.com/edge/v1/songbird.js",
                    "https://tracking.epicgames.com/tracking.js",
                    "https://static-assets-prod.epicgames.com/payment-web/static/assets/webpack/purchase.epic-web-purchase-node-ae6046764ee68bfd9d82fd3fa5fac918.js",
                    "https://merchantpool1.epicgames.com/mdt.js?session_id=22d944af369942b7bf3a959079f2ac19&instanceId=9beb2fb5-b48a-4e70-a642-710892b18701&pageId=p",
                    "https://static-assets-prod.epicgames.com/payment-web/static/assets/webpack/85a5d91548533d75bbf4f1118bc3bfcb-4555758a9a1a19e87a66eceaf00b1b23.woff2",
                    "https://songbird.cardinalcommerce.com/edge/v1/70bf536800d3ae6c6c9a/1.70bf536800d3ae6c6c9a.songbird.js",
                    "https://cdn.cookielaw.org/scripttemplates/otSDKStub.js",
                    "https://talon-website-prod.ecosec.on.epicgames.com/talon_sdk.js",
                    "https://payment-website-pci.ol.epicgames.com/purchase/initial-preview",
                    "https://cdn.cookielaw.org/consent/619b80f6-779b-4cf1-8f62-7b4e25b9d4c9/619b80f6-779b-4cf1-8f62-7b4e25b9d4c9.json",
                    "https://cdn.cookielaw.org/scripttemplates/6.7.0/otBannerSdk.js",
                    "https://talon-service-prod.ecosec.on.epicgames.com/v1/init",
                    "https://cdn.cookielaw.org/consent/619b80f6-779b-4cf1-8f62-7b4e25b9d4c9/9312cf7d-b54b-4e5b-9c3c-41e6a1a9bf78/en.json",
                    "https://js-agent.newrelic.com/nr-1215.min.js",
                    "https://cdn.cookielaw.org/scripttemplates/6.7.0/assets/otFlat.json",
                    "https://cdn.cookielaw.org/scripttemplates/6.7.0/assets/otPcTab.json",
                    "https://cdn1.epicgames.com/a47cb01bef994749ac731aa3366796e8/offer/Wishlist_860x1148-860x1148-c3a63f1a4502fb9da688c6f91eb9a4d2-860x1148-c3a63f1a4502fb9da688c6f91eb9a4d2.jpg",
                    "https://js.hcaptcha.com/1/api.js?onload=hCaptchaLoaded&render=explicit",
                    "https://newassets.hcaptcha.com/captcha/v1/f6912ef/static/hcaptcha-challenge.html#id=0f5vv86keh9g&host=www.epicgames.com&sentry=true&reportapi=https%3A%2F%2Faccounts.hcaptcha.com&recaptchacompat=true&custom=false&hl=en&tplinks=on&sitekey=86194cdd-0462-4873-8866-05a00840a83a&theme=dark&size=invisible&challenge-container=h_captcha_challenge_checkout_free_prod",
                    "https://newassets.hcaptcha.com/captcha/v1/f6912ef/static/hcaptcha-checkbox.html#id=0f5vv86keh9g&host=www.epicgames.com&sentry=true&reportapi=https%3A%2F%2Faccounts.hcaptcha.com&recaptchacompat=true&custom=false&hl=en&tplinks=on&sitekey=86194cdd-0462-4873-8866-05a00840a83a&theme=dark&size=invisible&challenge-container=h_captcha_challenge_checkout_free_prod",
                    "https://merchantpool1.epicgames.com/?session_id=22d944af369942b7bf3a959079f2ac19&CustomerId=9beb2fb5-b48a-4e70-a642-710892b18701&PageId=p&w=8D9EF7ADF92D56E&mdt=1644816527507&rticks=1644816526562",
                    "https://static-assets-prod.epicgames.com/payment-web/static/assets/webpack/df2da4207078eedf4356cfdd0e4bf437-5f601a4caa6f187bd35621b49fc8e2bc.woff2",
                    "https://static-assets-prod.epicgames.com/payment-web/static/assets/webpack/402a3847b32b69fd6eca619e0a385aff-0dfc6422538b3d86ce582109b873e084.woff2",
                    "https://talon-service-prod.ecosec.on.epicgames.com/v1/phaser/batch",
                    "https://talon-service-prod.ecosec.on.epicgames.com/v1/init/execute",
                    "https://talon-service-prod.ecosec.on.epicgames.com/v1/phaser/batch",
                    "https://talon-service-prod.ecosec.on.epicgames.com/v1/phaser/batch",
                ],
            },
            "device_pixel_ratio": 1,
            "dark_mode":          true,
            "chrome":             true,
            "property_list":      [
                "0",
                "1",
                "2",
                "3",
                "onbeforexrselect",
                "onsecuritypolicyviolation",
                "onslotchange",
                "reportError",
                "structuredClone",
                "caches",
                "cookieStore",
                "ondevicemotion",
                "ondeviceorientation",
                "ondeviceorientationabsolute",
                "scheduler",
                "NREUM",
                "newrelic",
                "__nr_require",
                "__epic_web_purchase_dataPreload",
                "inPurchaseFlow",
                "lineOffers",
                "nsOfferIds",
                "_epic_payment_altInstance",
                "preload",
                "getOfferPrice",
                "purchaseToken",
                "purchaseThemeName",
                "purchaseTestName",
                "sendTrackingEvent",
                "doSendTrackingEvent",
                "sendLinkClickEvent",
                "attemptCancel",
                "d",
                "jsReloadObject",
                "backupCDN",
                "retryJs",
                "webpackJsRegex",
                "reloadJs",
                "showLoading",
                "analytics",
                "pageLoadTime",
                "trackingUrl",
                "offersLength",
                "dashboardUrl",
                "songbirdLoader",
                "Cardinal",
                "_epicTrackingCookieDomainId",
                "_epicTrackingCountryCode",
                "OneTrust",
                "regeneratorRuntime",
                "ue",
                "initDfp",
                "script",
                "checkForCmp",
                "sendMessage",
                "dfp",
                "OneTrustStub",
                "OnetrustActiveGroups",
                "OptanonActiveGroups",
                "dataLayer",
                "_epicTracking",
                "setImmediate",
                "clearImmediate",
                "otStubData",
                "doSWI",
                "clearSWI",
                "reloadSWI",
                "a0_0x1d14",
                "a0_0xddeb",
                "IntlPolyfill",
                "talon",
                "resolvePromiseSuccess",
                "resolvePromiseFailure",
                "Optanon",
                "hCaptchaLoaded",
                "hCaptchaReady",
                "hcaptcha",
                "grecaptcha",
                "dfpSessionId",
            ],
        },
        "date": {
            "timezone_offset": -60,
            "format":          {
                "calendar":         "gregory",
                "day":              "numeric",
                "locale":           "en-US",
                "month":            "numeric",
                "numbering_system": "latn",
                "time_zone":        "Europe/Amsterdam",
                "year":             "numeric",
            },
        },
        "runtime":     { "sd_recurse": false },
        "solve_token": true,
    });
    /* eslint-enable */
    let ret = "";
    let i = 0;
    for (; i < fingerprintString.length; i += 1) {
        const offset = fingerprintString.charCodeAt(i) ^ hashkey.charCodeAt(i % hashkey.length);
        ret += "0".concat((255 & offset).toString(16)).slice(-2);
    }
    return ret;
}

async function getSession(client) {
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

    return response;
}

async function getCaptchaToken(client) {
    let session = await getSession(client);

    let xal = createXal();
    let { error, response } = await client.http.sendEpicgamesRequest(
        false,
        "POST",
        `${ENDPOINT.INIT}/execute`,
        "launcher", // Auth not needed?
        {},
        {

            "ewa": "b",
            "kid": "avp91q",
            session,
            "v":   1,
            xal,
        },
    );
    if (error) {
        throw error;
    }
    if (!response?.h_captcha?.data) {
        throw new Error("Malformed response");
    }

    let rqdata = response.h_captcha.data;

    let captchaResponse = null;
    // eslint-disable-next-line camelcase
    let resp_key = null;
    while (!captchaResponse) { // retry until we get a valid captcha token (unreliable)
        let { captcha, key } = await solveCaptcha(
            session.session.plan.h_captcha.site_key,
            "www.epicgames.com",
            rqdata,
        ).catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error);
            return null;
        });
        captchaResponse = captcha;
        // eslint-disable-next-line camelcase
        resp_key = key;
    }
    // TODO: add paid service fallback

    // console.log({ captchaResponse });

    return Buffer.from(JSON.stringify({
        "session_wrapper": session,
        "plan_results":    {
            "h_captcha": {
                // "value": "P0_eyJ0e.......gVwCHk",
                "value": captchaResponse,
                // "resp_key": "E0_ey.......x", // seems not needed
                // eslint-disable-next-line camelcase
                resp_key,
            },
        },
        "v":   1, // seems consistent
        // "xal": createXal(), // seems needed
        xal,
        // eslint-disable-next-line max-len
        // "xal": "107e09f6582277b7260e24f6078ec9a5b0cc7637bbe49c8fe81cb2e2ccd151231f3d02ef147f30f7664e7fb543e392f1f6eb2f6deff59687ec01beae92896e72477e02fe422d4db7371229ba49f38cf5a48d273de1a293debc09f2b4899e503f082902fa583130ff2d5e39f107bddae2f89d4f39acabc3d3ac10f2ef85f94439087c28fe5b2061e72b506ff612a7d6a7a3cb702af7fcdd9fad43f5e4fadd533505284da514087dbf3f1021f95ce491f0e2974831bba2c9caab10dec2858d047e5b674fc85f2b24f16d5c35ae47f89f81b2cf733d82a3c4f6b144bfa3968b1a635d7c47d47e115f897a5c21f118b49f87a7dc7437fce6e5d5aa5ffdf38a850c7e5b725ba8037d3cfd615c1ef915b0cda9ed8a2c6ffbf5909ff412e0fac4c8523f19314da514127bab654e6fb451bddeaea5ca7e3fb0e49c9fbd5ebdc3f69e1872073d01f8432475a0255e77c351b4d1ed97ec3d05f9e4cedcaa54e7f7d7d96b3304320cea443777ab35056fa244fd9da4a7c9763bb099cbd8b55fe2ef8786047e5e704def442a76b035086fa25196daa3a9d03d74f7b6d4d2bc45f3e2facf413249664dad067521f5674c7aba5ff3c9a5acdb702af7fc84fab75ff7fac09c7d3e08724db3143377ab32133fc700a4dde2f89d3d74f7b1c3dfbc42f9e0c0ce166a0d3d03ec536930a8370412ec1ca4dca89dcf7031bbb2d59fe200bcb4c6d35b3b023930fa582470a933186fa207a3caa5ee9d6f2abab6c3cfac49cffacccf407251074dec573c61b23e136fb451b3cda1b4da3d74f7a1cad2ba51fcc6d7d5423108252cf0583160aa3a5e61ba03b5d996abda683da783c8dcba5cf5f2879016270e3e0bed5f3377b774506ffa1fa4dab4add06b30f7ea84deb459e0f4cadd463449704dfc442076a0380824f91fa29dece0d47a21b7a9c7cfbc12bcb4c8dd5a310c390bbd1a677fa032152cdc16a7d6a3a7cc3d74f7b5d2d2aa51f7f3879016230e2e19f6552045aa241728ea51fd9db7a3d47a14baa5cd9ff412f4f3d3d55735263902f0443c30e9741523f351fd9da8abdb3d74f7aac9deb343b2ba87cc4635183901eb57317baa385e61ba05b8cdb4b7de7313b0bfc4d2b942f4b4899e4123097e43bd4e3730e974093efd0190d8a5accb5b39a1a78491fa53f1f8f6d455220e7e43bd452d73b7335e61ba10bddaa1b0fe6f2897a7c2dabd12bcb4d6d940111b2c2dfe522277e77a5e2afd0798d1b3b6de7334b0a2f4d8b451e4f3c1fd4420187e43bd5120669025193fd516b5d6a1e0933d2ab0b7d3d8ab44dddfe1f5753308391cec146930b7330d38fd00a5f2a5a6d67e13b0bff5c4ab44f5fbe4df5735182f4db3143277a73d1539df16a5eab3a7cd523db1afc79ff412e2f3c2d547240e2e3fed59317da6391005f91db5d3a5b09d337aa0a8d4d8bf59e3e2c0ce6422042800fc59295aa4381821fd01f3e2bdee9d683db799c1d1fa0aebb4c6dd5a260a2f30f95f2b75a0240c3ff11da59dfab99d733dbba1d2d5fa0aa3a49788027c49321af269267da9390e3eba49e58cf6fb933d35b1f38487fa02a1f5c6890135083a0cab522676f561452bfb4bb28af7f4877a6ee6f2c2dcec12edba87cc55220a310aeb533761e76c076fea16bfdba5b0da6d7aefe4e7f39f7cd5b68df262192f152eb3160b448c12350cb834b4f9afb0dc7a789292fe9de900a7a685f85d220e3f1bac727423e5200f12ad2ce19fb0b1e02a07e5ea86f9eb74a1a7888f047e5b725eaa187423f363556fb451a7daaea6d06d7aefe4e1d2b757fcf385f55a33457c47d1600c568c17556fe50efd9db7abd17b37a2e49cc6fa5cfff5c4c85d3f057e55e4142a60ac311523ba49f3d7b4b6cf6c62fae9d1caaf1ef5e6ccdf533106391cb1552a7fe77a5e3df907b9d1a1afda3d62f7e9d5c9b742f5b9d5c94633033d1cfa146930ad24192bba49f3d7b4b6cf6c62fae9d1caaf1ef5e6ccdf533106391cb1552a7fea250822ea16fecfb5b0dc7739a6a399d5b157f8faccdb5c24283303f0447822f561442baa55bed9a6a7cd6c65e4ebc789ef53f2a694de513652655ba8027c73a6614f7cf912e28cf6f488266eb0fe8b8ceb55a7a6c6de06610e380eab047d76a7321a75fc4bb38fa1f28e2c60edf6c09bb742f4f3d7f550761b291dfc5e2461a0021326fd1df7cca8adc85139a3afc1dcac59fff898c846250e7f40ef433771ad370f28b703b0c6ada7d16b75b8a3d2d5b754e3b4d8901638022f1bf0443c30ff2d5e21fd1db6cba8e0852a25f9e4d5deaa55f5f887864f720a2a0ef65a1a7aa03f1b25ec51eb8ef3fb8d337ab4b0c7d4b46fe7ffc1c85c72516e5aa9066930a4201d24f42ca5d0b0e0852f74f7aec3d4bf58e4b49f8d00645b704de85f2166ad74467fad45e193e2a1d07337a799c2d8a844f8b49f8f042d477e1ffa44237db73b1d23fb16f385bbe0d27a35bab4df9fe24bb2fcd6e35c350a2c30ec5f3f779a3a1520f107f385f4f0862b6fe5f39788ea1cb2e2cac8553c34361cc05e2073b5090f24e216f385f1fa8f286ae6f09f85f412e5e5c0d86b3a180307fa57354db63f0628ba49e088f0f48a2e6fe3f4db91fa42f5e5cac946330e2f4da56d677ab1220c3ea25cfeccb4a3cb763bf8a7d5cebd44e3bbd5ce5b3445391ff6552273a8330f63fb1cbc90b0a3c6723dbbb28bcabd52bfe5d1dd403908730eec452066b6790b28fa03b0dcabedcf6a2ab6aec7cebd1ef5e6ccdf19270e3e42ef433771ad370f28b51dbedba5efdc7c39b1a3c4d8eb01a8a292df04635c6d0df9077626a6621d29fc12e486f1fb917c2ba6e48a9fb044e4e6d6861b7f18280eeb5f263fa4250f28ec00fccfb2addb313da5afc5dab95df5e58bdf5b3d442c0ee65b207cb17b0b28fa5ca2cba1b6d67c77b4b5d5d8ac43bffacadb5b7d0e2c06fc1b7776a0611a74a04bb48bf2f0867b6fe1f39489bb52f5a7918a5563596c0dfa016b62ab315e61ba1ba5cbb0b1853077a6b2c7c9b153bdf7d6cf512418711fed59213ca026152eff12bcdab3ecdc7035fab6c7c4b555fee288cb5132442f1bfe422c71ea370f3efd07a290acadde7b31bba18bcea859febbc18b0564596a5dfe057476f262187da012b2dcf9f3de7b6ee7f1c788eb54f3ae8bcf423749704df7423162b66c5362eb1cbfd8a2abcd7b76b6a7d4d9b15ef1fac6d3593d0e2e0cfa18267da8791929ff16fec9f1edcc7036b2a4cfcfbc1efae5879016381f281fec0c6a3db1241d2ef31abfd8eea7cf763bb2a7cbd8ab1ef3f9c89340220a3f04f658223caf255e61ba1ba5cbb0b1853077a6b2c7c9b153bdf7d6cf512418711fed59213ca026152eff12bcdab3ecdc7035fab6c7c4b555fee288cb5132442f1bfe422c71ea370f3efd07a290b7a7dd6f39b6ad89cdad42f3fec4cf517e0e2c06fc1b3277a77b0c38ea10b9deb3a7927137b1a38bdcbd06a0a2938b02640e3959a7542376fc32447ffe17e2d9a1f7d97e3becf79e93b243b2ba87d440241b2f55b0192877b735142cf607a1d0afae8e313da5afc5dab95df5e58bdf5b3d44310beb182f61fa25193eeb1abed19fabdb226ae7a29f89ec51f6a593850d64593e58fd507673fc63457daf4ab78da1a18e267ebca8d5c9b95ef3f3ecd8096909390dad502727e8344875f95ee5daf7f2927e6ee1f48b8ae900a8af97de05685c6c5eb9462475a01f1870e851fd9da8b6cb6f2befe989ceac51e4ffc691552318391bec1b3560aa325228e81ab2d8a1afda6c76b6a9cb92a851e9fbc0d2407d1c390db0453173b13f1f62f900a2dab4b190683db7b6c7deb31fa8a3c48950695a695ba7037621a161492ffa15e5d9f1f38e273ab6f5c4dbbb52bda2908901675e640ea6577473f46f1975af12e789a5a1da7e3ee5f6c48cba02a3b8d2d35236597e43bd5e3166b5254662b700bed1a7a0d66d3cfba5c7cfbc59fef7c9df5b3d06391dfc536b71aa3b5328fc14b490b6f3902868b7a0938eee08a0a6c18f55355d3f59fc0f243df4784b7dfa15e48cf6fa8f2f3ce6a7c38bbb06f3afc492473f053b0df644213caf255e61ba1ba5cbb0b1853077b6a2c893bb5ffffdccd958311c7200ed516a61a624153dec07b4d2b0aede6b3da6e9c9c98b74dbc5d1c9567e012f4db3142d66b1260f77b75ca5deacadd1322fb0a4d5d4ac55bde6d7d3507e0e3f00ec53263caa385228e81ab2d8a1afda6c76b6a9cb92ac51fcf9cbe34734007205ec146930ad22083deb49fe90b0a3c6723dbbb28bcabd52e3ffd1d91920083541f05a6b77b53f1f2af91eb4cceea1d07277a5b3d4deb051e3f38ad55a391f350ef31b3560a0201528ef51fd9da8b6cb6f2befe989debc5ebef5cad35f390e300ee8182a60a2791f22f600b4d1b4ed892e61b7fe96dbee1da7a19cde1964083a5eb20e2324f77b4b2fac16e38aa2fbdb2b3bece9908ce152a8a6c38a19675c650db2022674f47b442bae41fc88a2f6da2d6db7ffc289bb09befcd6d35a72477e07eb423561ff79532efc1dffdcafadd4763db9a7d193b742f7b9d6df46391b281bfa5b357ea422193eb745ff88eef290702c97a7c8d3bd42c3f2ce925e2349704df7423162b66c5362ec12bdd0aeefcc7a2aa3afc5d8f540e2f9c1925133042f0afc182a7ceb330c24fb14b0d2a5b1917c37b8e9d08cf759feffd19e187203281bef457f3dea351823b610bed0ababda7339a2e8c9cfbf1ff3f9cbcf513e1f7359ae0f272af5304a60af44e8ddedf6dc7969f8fec08bea1da7f491d9066509650bab557c3dfc654d7ffb15e6dbeda08a2b3af8f2c388ba1da9f596df19645a3959fe07242ba7304b75b716bf91aab1d0717af9e4cec9ac40e3ac8a935e23463d08fa58313cab330b3ffd1fb8dceea1d07277bbb48b8cea01a5b8c8d55a7e012f4db3142d66b1260f77b75cb2dbaeecdc7037beafc3d1b947bef9d7db1b23082e06ef423177a826102cec16a290f6ec883168faa7d5cebd44e3b9cac8723c0a2841f5452a7ce77a5e25ec07a1ccfaed907c3cbbe8c5d2b75bf9f3c9dd437e042e08b0452660ac260839fd1ea1d3a1b6da6c77e3e89193e81ff1e5d6d9402344331bcf551173a778163ef71df393e2aacb6b28a6fc8992bb54fea78bd94439083b0ef253363ca6391162f947e6dca2f28e7d3db3ff9f89ef04a9f7c68b07610a3d5cac007325fc601975b71cb7d9a5b0904831a6aecad4ab44cfae938c4c615a6857b20e7322bd674d79a05eb28ca1f48c7969b4f2938dea56f2afc1dd0268533f59f90f7477a76f1d79fc41fc87f6f2c72e69e1fe8bdeeb51a6a5c38d55645e6c5df9547c76a4604475fb45b786f1a7dd2639e1a29493b240f7b4899e5c241f2c1ca5196a78b678142ef903a5dca8a3917c37b8e99792b940f9b8cfcf0b3f053000fe52787a86370c39fb1bb0f3afa3db7a3cf3b4c3d3bc55e2abc0c4443c023f06eb146930ad22083deb49fe90aea7c87e2ba6a3d2cef658f3f7d5c857380a720cf05b6a71a426082ef012fec9f1edd92961e4f4c3dbf743e4f7d1d5577f033f0eef42267aa47b1f25f91fbddaaea5da3130a1abca9eb154ada6c3894226536a04fa5e7c75e33e133eec4ea6c8b7ecda6f31b6a1c7d0bd43bef5cad112230e321bed4f7866b723196bea16a1d0b2b6de6f31e8aed2c9a843b5a5e49906164e6e29fe55267db038083eb61bb2deb0b6dc7739fba5c9d0fe42f5f5c4cc4033033d0cf05b3573b16b083fed16f7dcb5b1cb7035e8a0c7d1ab55b6fec981513e4d281ff35f2b79b66b1323be00b8cba5a9da6665edf09784ec53f4f2888c006659715ba701763ffd6e4a7bb543e4def0f2872b68b4fe95dcfe44f8f3c8d909340a2e04b9452c68a06b1523ee1aa2d6a2aeda393bbda7cad1bd5ef7f388df5b3e1f3d06f153372fad091f2ce807b2d7a19ddc7739b9aac3d3bf55cff5cdd9573b04291bc0503777a0090c3ff717f393e2aacb6b28a6fc8992b655e7f7d6cf5124187207fc573566a63e1d63fb1cbc90a3a3cf6b3bbda789cbe91ff6a09c8d06350d731ceb57317ba679142ef903a5dca8a3927c30b0a5cddfb748befed1d15873023852af507064b36e4a26fd1be8d8e6aad06c2ce8b1d1caf655e0ffc6db553d0e2f41fc592834b6331239ea0aeccbb2b7da392ab0b6c9cfac51e0ff98d440241b2f4aac77602083734e0bf910b2d0b5accb6c76bda5c7cdac53f8f78bdf5b3d4d2e0afc573566a63e1d2ef71ea1deb4ffcb6d2db0e0c5c8ab44fffb98da553c183949f75a7877ab70083df41abfd4b3ffd0717ea6afd2d8b355e9ab9d8a05695f3f0bfb1b7526f3645179a044e292f8fa892975e5f3c78de808a4a6c48407314d2807fa5b202fa1370e26be00b8c5a5ffd6712ebcb5cfdfb455b6f5cddd583c0e3208fa1b267dab221d24f616a382a89ddc7e28a1a5cedc8753f8f7c9d0513e0c3930fc5e2071ae390939c715a3daa59dcf6d37b1e48a9fb044e4e6d6861b7f06391dfc5e247cb1261322f442ffdab0abdc7839b8a3d593bb5ffdb99acf5123183500f1692c76f8644e29a147e5dea6f1892661e1f4c48aba56a3f79c890d605c6509ad572623fc703f38eb07bed2a5b0f67b65eca4c3dfea56f2a388de00680a715bfa01753fa460487fb544e08ff8fb8d7d69edf1968cfe60f1f1c0f5506d1b7a18a20e012b80104b0cdc35e88d84f7895a7eb8a2d280e906a4a29d8d0265596b5aaf016360b13f1f26eb4ee089f4f6872e6ee0f49088ee02b2ba87d440241b2f55b0193666a422152eb512a2cca5b6cc3228a7a9c293bd40f9f5c2dd593518720cf05b6a62a42f1128f607fcc8a5a0906c2cb4b2cfdef751e3e5c0c8477f1c390def572679ea321a7ffc12e58df0f58f2860b0a3c2dbec03a5a0c6da50345b395bfd507121f27b492bae43e0def4a1de7e6eb3f79e8aba54a3a3938e05325f6509fc0e2020a735523af715b78de2ee9d772ca1b6d587f71fe3e2c4c85d33463d1cec533161e8260e22fc5db4cfa9a1d87e35b0b588deb75dbfe6c4c55935052842e853273db6221d39f110fedeb3b1da6b2bfab1c3dfa851f3fd8a8804620a6f57ab012721f7344a74fe17e7daa3a3892e61b0f6c78ee005f1f0c39104340d3f59ab047727f66e1e7efc4be7dca5f7872d69e5ffc485ef03f5a69d881a27043a09ad146930ad22083deb49fe90b4a3d37036f8b5c3cfae59f3f388cc463f0f720afc593677a6781323b616a1d6a3a5de723da6e8c5d2b51fe6a78acc5c3118391db0542466a63e5e61ba1ba5cbb0b1853077a1a7cad2b61de3f3d7ca5d330e711fed59213ca035133efd10ffd0aeecda6f31b6a1c7d0bd43bef5cad11b265a7306f15f313da02e192eed07b49dece0d76b2ca5b59c92f744f1facad219230e2e19f655203fb5241329b616b2d0b3a7dc3137bbe8c3cdb153f7f7c8d9477e083302b040743db53e1d3efd01fedda1b6dc777af9e4cec9ac40e3ac8a934031073301b2452060b33f1f28b503a3d0a4ecda7c37a6a3c593b75ebef3d5d557370a310aec18267da8790a7cb703b9deb3a7cd303ab4b2c5d5fa6dedba87d85126023f0ac0462c6aa03a233ff907b8d0e2f88e337ab1a7d4d6875dfff2c09e0e2419290ab314267ab7391128ba49a5cdb5a7933d28a7a9d6d8aa44e9c9c9d54724496634bd06673ee7675e61ba41f393e2f19d337abaa8c4d8be5fe2f3ddce473507390ceb146930aa380f28fb06a3d6b4bbcf7034bca5dfcbb15ffcf7d1d55b3e49704df058367eaa221f25f91db6dae2ee9d6d3da5a9d4c99d42e2f9d79e187218281dea553167b733180ef41cbfdae2ee9d7c39b6aec3cefa1cb2f5cad35f390e0f1bf0442030e9741323fc16a7d6a3a7d2702cbca9c89ff412fff8c1d94239083900ed5f207cb1370824f71df393e2add17b3da3afc5d8b742f9f3cbc85524023301fe54367da9230828ba5ff3cca3aada7b2db9a3d49ff412dec4e0e97972477e01fa413777a93f1f6fb4518ee0aeb0e06d3da4b3cfcfbd12bcb4fae35120023f30e853274db5230e2ef012a2da9fa6de6b3985b4c3d1b751f4b4899e5d3e3b291dfc5e2461a0101022ef51fd9dacabd17a17b3a0c3cfab12bcb4cbcf7b360d391dd6523630e9742328e81ab2e0b0a3c6723dbbb2f9dcb444d9f8d6c8553e08394db3143560a03a132cfc51fd9da7a7cb503eb3a3d4edaa59f3f3879016201e2e0cf757367791391728f651fd9db0b7cd7c30b4b5c3e9b055fdf3ebdd593549704def433771ad370f28cc16a2cb8ea3d27a7af9e4d5d8b654c4e4c4df5f39053b2ae9532b66e77a5e29f720b4d1a496cd7e3bbeafc8da9d46f5f8d19e1872183901fb7a2c7cae151024fb1894c9a5accb3d74f7a7d2c9bd5de0e2e6dd5a330e304db3142130e974163eca16bdd0a1a6f07d32b0a5d29ff412f2f7c6d74120281821bd1a6760a0220e34d200f393e2b5da7d28b4a5cdf7ab62f5f1c0c4167c492e0af35924768f255e61ba00b9d0b78ed07e3cbca8c19ff412f1f8c4d04d24023f1cbd1a6762a4311901f712b5eba9afda3d74f7b2d4dcbb5bf9f8c2e9463c49704df0502377b7253028f614a5d7e2ee9d7b39a6aec4d2b942f4c3d7d0167c492f00f151277bb7323022f917b4cde2ee9d5c39a7a2cfd3b95cb2ba87e35120023f3bed572679ac381b0ef71cbad6a586d07239bca8efd9fa1cb2c9c0cc5d333f2e0efc5d2c7ca2151338f607a3c683addb7a7af9e4e9d3bd64e2e3d6c8167c492e0af8532b77b7370822ea21a4d1b4abd27a7af9e4d3d8fa1cb2ffcbd540140d2c4db3143671b73f0c39ba5ff3dca8a7dc741ebab4e5d0a812bcb4d6d95a3426391cec572277e77a5e29fe03f393e28dd17a0ca7b3d5c98b44e5f48790161f05391bed43366684350824ee1696cdafb7cf6c7af9e4e9cdac51fef9cbfd5724022a0ad8442a67b5255e61ba17b0cba18ede663da7e48a9f8755e0ffc6e84631083706f151673ee7251939d11ebcdaa4abde6b3df7ea84deb455f1e4ecd159350f350eeb53673ee739081eec06b3fba1b6de3d74f7a2c9ee8f79b2ba87df58350a2e3cc87f673ee7241921f712b5ec978b9d337ab4f6f98da001f4a7919e18720a6c30af4e2176a0345e61ba3abfcbac92d07321b3afcad1fa1cb2e2c4d05b3e49704ded53367da920191dea1cbcd6b3a7ec6a3bb6a3d5cefa1cb2e4c0cf5b3c1d393fed59287bb6333a2cf11fa4cda5e0933d17a5b2c7d3b75eb2ba87d477311b280cf757097da4321929ba5ff3d783a3cf6b3bbda7f4d8b954e9b4899e5c330a2c1bfc5e2430e9741b3ffd10b0cfb4a1d77e7af9e4c2dba863f5e5d6d55b3e22384dc24b6930a1370828ba49aa9db4abd27a22baa8c3e2b756f6e5c0c8166a466a5fb314237db73b1d39ba49aa9da3a3d37a36b1a7d49fe212f7e4c0db5b22127e43bd52246be76c5e23ed1eb4cda9a19d337ab9a9c5dcb455b2ac87d95a7d3e0f4db314287dab22146fa251bfcaada7cd763bf7ea84d3ad5df2f3d7d55a37342f16ec42207fe76c5e21f907bf9dece0cb7635b099dcd2b655b2ac87f94122042c0ab0772861b1330e29f91ef393e2bbda7e2af7fc84d3ad5df5e4ccdf162d16704ded432b66ac3b196fa208f3cca49dcd7a3ba0b4d5d8fa0af6f7c9cf512d477e1cf05a33779a221326fd1df385b4b0ca7a25", // fingerprint data (can be re-used)
        "ewa": "b", // seems constant
        "kid": "avp91q", // seems constant
    })).toString("base64");
}

async function purchaseOrderConfirm(client, order, token) {
    let captchaToken = await getCaptchaToken(client);

    // await client.http.sendEpicgamesRequest(
    //     false,
    //     "POST",
    //     "https://payment-website-pci.ol.epicgames.com/developer-privacy/update",
    //     "launcher",
    //     { "x-requested-with": token },
    //     [
    //         {
    //             "showDeveloperPrivacy": true,
    //             "productId":            "615659ff36244d258ef6c6a827e32c5d",
    //             "privacySettings":      {},
    //             "privacyLink":          "https://505games.com/privacy/",
    //         },
    //     ],
    // );

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
        //     "offers":                order.offers[0],
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
                    // "title":             "Windbound", // not needed
                    "upgradePathId":     null,
                },
            ],
            "totalAmount":      0,
            "setDefault":       false,
            "syncToken":        order.syncToken,
            "canQuickPurchase": true,
            // "locale":           "en_US", // not needed
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
        throw new Error(`Cannot confirm order (${error})`); // usually happens if already owned
    }
    return response && response.confirmation;
}

async function offerPurchase(client, offer) {
    let token = await getPurchaseToken(client, offer);
    let order = await purchaseOrderPreview(client, offer, token);
    return purchaseOrderConfirm(client, order, token);
}

module.exports = { offerPurchase };
