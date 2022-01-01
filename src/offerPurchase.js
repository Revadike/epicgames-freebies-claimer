"use strict";

const ENDPOINT = {
    "PORTAL_ORIGIN": "ue-launcher-website-prod.ol.epicgames.com",
    "PURCHASE":      "https://payment-website-pci.ol.epicgames.com/purchase",
};

// async newPurchase(offer) {
//     let { data: purchase } = await this.http.sendGet(`https://${ENDPOINT.PORTAL_ORIGIN}/purchase?showNavigation=true&namespace=${offer.namespace}&offers=${offer.id}`);
//     purchase = Cheerio.load(purchase);
//     const token = purchase('#purchaseToken').val();
//     return {
//         token,
//     };
// }

//   async purchaseOrderPreview(purchase, offer) {
//     const { data } = await this.http.sendPost(
//         `${ENDPOINT.PURCHASE}/order-preview`,
//         `${this.account.auth.tokenType} ${this.account.auth.accessToken}`,
//         {
//             useDefault: true,
//             setDefault: false,
//             namespace: offer.namespace,
//             country: null,
//             countryName: null,
//             orderId: null,
//             orderComplete: null,
//             orderError: null,
//             orderPending: null,
//             offers: [
//                 offer.id,
//             ],
//             offerPrice: '',
//         },
//         true,
//         {
//             'x-requested-with': purchase.token,
//         },
//     );

//     if (data.orderResponse && data.orderResponse.error) {
//         throw new Error(data.orderResponse.message);
//     }
//     return data.syncToken ? data : false;
// }

//   async purchaseOrderConfirm(purchase, order) {
//     const { data } = await this.http.sendPost(
//         `${ENDPOINT.PURCHASE}/confirm-order`,
//         `${this.account.auth.tokenType} ${this.account.auth.accessToken}`,
//         {
//             useDefault: true,
//             setDefault: false,
//             namespace: order.namespace,
//             country: order.country,
//             countryName: order.countryName,
//             orderId: null,
//             orderComplete: null,
//             orderError: null,
//             orderPending: null,
//             offers: order.offers,
//             includeAccountBalance: false,
//             totalAmount: order.orderResponse.totalPrice,
//             affiliateId: '',
//             creatorSource: '',
//             syncToken: order.syncToken,
//         },
//         true,
//         {
//             'x-requested-with': purchase.token,
//         },
//     );
//     if (data.error) {
//         throw new Error(data.message || data);
//     }
//     return data && data.confirmation;
// }

//   async purchase(offer, quantity) {
//     const purchase = await this.newPurchase(offer);
//     if (!purchase || !purchase.token) {
//         throw new Error('Unable to acquire purchase token');
//     }
//     const order = await this.purchaseOrderPreview(purchase, offer);
//     if (!order) return false;
//     return this.purchaseOrderConfirm(purchase, order);
// }

// TODO
function offerPurchase(client, offer) {
    let err = new Error("Not yet implemented a way to purchase an offer");
    err.offer = offer;
    throw err;
}

module.exports = { offerPurchase };
