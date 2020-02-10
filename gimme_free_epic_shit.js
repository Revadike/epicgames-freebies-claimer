const { Launcher } = require(`epicgames-client`);
const { email, password } = require(`${__dirname}/config.json`);
const epicClient = new Launcher({
    email: process.argv[2] || email,
    password: process.argv[3] || password
});

(async () => {
    if (!await epicClient.init() || !await epicClient.login()) {
        throw new Error(`Error while initialize or login process as ${epicClient.config.email}`);
    }
    
    console.log(`Logged in as ${epicLauncher.account.name} (${epicLauncher.account.id})`);
    
    let getAllOffers = async (namespace, pagesize=100) => {
        let i = 0;
        let results = [];
        while ((i * pagesize) - results.length === 0) {
            let { elements } = await epicClient.getOffersForNamespace(namespace, pagesize, pagesize * i++);
            results = results.concat(elements);
        }
        return results;
    };

    let all = await getAllOffers(`epic`);
    let freegames = all
        .filter(game => game.categories
            .find(cat => cat.path === `freegames`) &&
                game.customAttributes[`com.epicgames.app.offerNs`].value)
        .map(game => game.customAttributes[`com.epicgames.app.offerNs`].value);

    for (let namespace of freegames) {
        let offers = await getAllOffers(namespace);
        let freeOffers = offers.filter(game => game.currentPrice === 0 && game.discountPercentage === 0);

        for (let offer of freeOffers){
            let purchased = await epicClient.purchase(offer, 1);

            if (purchased) {
                console.log(`Successfully claimed ${offer.title} (${purchased})`);
            } else {
                console.log(`${offer.title} was already claimed for this account`);
            }
        }
    }

    await epicClient.logout();
    console.log(`Script finished!`);
    process.exit(0);

})().catch(err => {
    console.error(err);
    process.exit(1)
});