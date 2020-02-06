const { Launcher } = require(`epicgames-client`);

const epic = new Launcher({
    email: `YOUR_EMAIL_HERE`,
    password: `YOUR_PASSWORD_HERE`
});

(async () => {
    if(!await epic.init() || !await epic.login()) {
        throw new Error(`Error while initialize or login process.`);
    }
    
    console.log(`Logged in as ${epic.account.name} (${epic.account.id})`);

    let all = await epic.getOffersForNamespace(`epic`, 1000, 0);
    let freegames = all.elements.filter(game => game.categories.find(cat => cat.path === `freegames`));
    for (let game of freegames) {
        let namespace = game.customAttributes[`com.epicgames.app.offerNs`].value
        if (!namespace) {
            continue;
        }

        let offers = await epic.getOffersForNamespace(namespace, 100, 0);
        let offer = offers.elements.find(game => game.currentPrice === 0 && game.discountPercentage === 0);
        let purchased = await epic.purchase(offer, 1).catch(console.error);
        if (purchased) {
            console.log(`Successfully redeemed ${offer.title} (${purchased})`);
        }
    }
})();