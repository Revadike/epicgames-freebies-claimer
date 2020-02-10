const { Launcher } = require(`epicgames-client`);
const { email, password } = require(`${__dirname}/config.json`);
const defaultPageSize = 100;
const epicLauncher = new Launcher({
    email: process.argv[2] || email,
    password: process.argv[3] || password
});

console.log('Trying to log in as ' + epicLauncher.config.email);

(async () => {
    if (!await epicLauncher.init() || !await epicLauncher.login()) {
        throw new Error(`Error while initialize or login process.`);
    }
    
    console.log(`Logged in as ${epicLauncher.account.name} (${epicLauncher.account.id})`);
    
    let getAllOffers = async (namespace, pagesize=defaultPageSize) => {
        let i = 0;
        let results = [];
        while ((i * pagesize) - results.length === 0) {
            let { elements } = await epicLauncher.getOffersForNamespace(namespace, pagesize, pagesize * i++);
            results = results.concat(elements);
        }
        return results;
    };

    let all = await getAllOffers(`epic`);
    let freegamesNamespaces =
        all.filter(game => game.categories
            .find(cat => cat.path === `freegames`) && game.customAttributes[`com.epicgames.app.offerNs`].value)
        .map(game => game.customAttributes[`com.epicgames.app.offerNs`].value);

    for (let gameNamespace of freegamesNamespaces) {
        let offers = await getAllOffers(gameNamespace);
        let freeOffers = offers.filter(game => game.currentPrice === 0 && game.discountPercentage === 0);

        for (let offer of freeOffers){
            let purchased = await epicLauncher.purchase(offer, 1).catch(console.error);

            if (purchased) {
                console.log(`Successfully redeemed ${offer.title} (${purchased})`);
            }
            else {
                console.log(`${offer.title} was already redeemed for this account`);
            }
        }
    }

    await epicLauncher.logout();
    console.log("Script finished!");
    process.exit(0);

})().catch(err => {
    console.error(err);
    process.exit(1)
});