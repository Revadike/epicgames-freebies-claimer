# EpicGames Freebies Claimer
![image](https://user-images.githubusercontent.com/4411977/74479432-6a6d1b00-4eaf-11ea-930f-1b89e7135887.png)

## Description
Claim [available free game promotions](https://www.epicgames.com/store/free-games) from the Epic Game Store.

## Requirements
 * [Node.js](https://nodejs.org/download/)

## Instructions
1. Download/clone repo
2. (Optional) Edit `config.json` to include your EpicGames credentials
3. Run `npm install`
4. Run `node gimme_free_epic_shit` or `node gimme_free_epic_shit USERNAME PASSWORD`*

*Only this step is required after the initial use.

## FAQ
### Why should I use this?
This is for the truly lazy, you know who you are. ;)
Also, this is a good alternative, in case you don't like using Epic's client or website (and I don't blame you).

### Why should I even bother claiming these free games?
To which I will say, why not? Most of these games are actually outstanding games! Even if you don't like Epic and their shenanigans, you will be pleased to know that Epic actually funds all the free copies that are given away:  ["But we actually found it was more economical to pay developers [a lump sum] to distribute their game free for two weeks..."](https://arstechnica.com/gaming/2019/03/epic-ceo-youre-going-to-see-lower-prices-on-epic-games-store/)

## Changelog
### V1.1.1
 * Ensured all search results for all namespaces are purchased

### V1.1.0
 * Added support for email/password arguments
 * Moved saved credentials to config.json
 * Ensured all search results are returned
 * Fixed program not exiting

### V1.0.0
 * Initial release
