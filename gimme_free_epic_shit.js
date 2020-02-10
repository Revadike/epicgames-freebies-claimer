const { Launcher } = require(`epicgames-client`);
const { email, password } = require(`${__dirname}/config.json`);
const epic = new Launcher({
    email: process.argv[2] || email,
    password: process.argv[3] || password
});

(async () => {
    if (!await epic.init() || !await epic.login()) {
        throw new Error(`Error while initialize or login process.`);
    }
    
    console.log(`Logged in as ${epic.account.name} (${epic.account.id})`);
    
    let getAllOffers = async (ns, n=100) => {
        let i = 0;
        let results = [];
        while ((i * n) - results.length === 0) {
            let { elements } = await epic.getOffersForNamespace(ns, n, n * i++);
            results = results.concat(elements);
        }
        return results;
    };

    let all = await getAllOffers(`epic`);
    let freegames = all.filter(game => game.categories.find(cat => cat.path === `freegames`));

    for (let game of freegames) {
        let namespace = game.customAttributes[`com.epicgames.app.offerNs`].value
        if (!namespace) {
            continue;
        }

        let offers = await getAllOffers(namespace);
        let offer = offers.find(game => game.currentPrice === 0 && game.discountPercentage === 0);
        if (!offer) {
            continue;
        }

        let purchased = await epic.purchase(offer, 1);
        if (purchased) {
            console.log(`Successfully claimed ${offer.title} (${purchased})`);
        }
    }

    await epic.logout();
    console.log(`Enjoy!`);
    process.exit(0);

})().catch(err => {
    console.error(err);
    process.exit(1)
});