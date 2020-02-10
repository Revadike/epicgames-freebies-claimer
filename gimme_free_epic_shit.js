const { Launcher: EpicGames } = require(`epicgames-client`);
const { email, password } = require(`${__dirname}/config.json`);
const client = new EpicGames({
    email: process.argv[2] || email,
    password: process.argv[3] || password
});

(async () => {
    if (!await client.init() || !await client.login()) {
        throw new Error(`Error while initializing or logging in as ${client.config.email}`);
    }
    
    console.log(`Logged in as ${client.account.name} (${client.account.id})`);
    let getAllOffers = async (namespace, pagesize=100) => {
        let i = 0;
        let results = [];
        while ((i * pagesize) - results.length === 0) {
            let { elements } = await client.getOffersForNamespace(namespace, pagesize, pagesize * i++);
            results = results.concat(elements);
        }
        return results;
    };

    let all = await getAllOffers(`epic`);
    let freegames = all
        .filter(game => game.categories.find(cat => cat.path === `freegames`) &&
            game.customAttributes[`com.epicgames.app.offerNs`].value)
        .map(game => game.customAttributes[`com.epicgames.app.offerNs`].value);

    for (let namespace of freegames) {
        let offers = await getAllOffers(namespace);
        let freeoffers = offers.filter(game => game.currentPrice === 0 && game.discountPercentage === 0);

        for (let offer of freeoffers) {
            let purchased = await client.purchase(offer, 1);

            if (purchased) {
                console.log(`Successfully claimed ${offer.title} (${purchased})`);
            } else {
                console.log(`${offer.title} was already claimed for this account`);
            }
        }
    }

    await client.logout();
    console.log(`Logged out of Epic Games`);
    process.exit(0);

})().catch(err => {
    console.error(err);
    process.exit(1)
});