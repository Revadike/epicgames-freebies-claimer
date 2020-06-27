# EpicGames Freebies Claimer
![image](https://user-images.githubusercontent.com/4411977/74479432-6a6d1b00-4eaf-11ea-930f-1b89e7135887.png)

## Description
Claim [available free game promotions](https://www.epicgames.com/store/free-games) from the Epic Game Store.

## Requirements
 * [Node.js](https://nodejs.org/download/)

## Instructions (arguments)
1. Download/clone repo
3. Run `npm install`
4. Run `npm start USERNAME PASSWORD 0|1 2FA_SECRET`*

## Instructions (config)
1. Download/clone repo
2. Run `npm install`
3. Edit `config.json` to include your EpicGames credentials and options
4. Run `npm start`*

*Only this step is required after the initial use.

## FAQ
### Why should I use this?
This is for the truly lazy, you know who you are. ;)
Also, this is a good alternative, in case you don't like using Epic's client or website (and I don't blame you).

### Why should I even bother claiming these free games?
To which I will say, why not? Most of these games are actually outstanding games! Even if you don't like Epic and their shenanigans, you will be pleased to know that Epic actually funds all the free copies that are given away:  ["But we actually found it was more economical to pay developers [a lump sum] to distribute their game free for two weeks..."](https://arstechnica.com/gaming/2019/03/epic-ceo-youre-going-to-see-lower-prices-on-epic-games-store/)

### Can I use the looping or multi-account feature when using launch arguments?
No, these are only usable by using the config.

## Changelog
### V1.4.1
 * Removed the need for graphql query

### V1.4.0
 * Added two factor authentication (2fa) support while EpicGames changed policy (Closes #17, #19, #21)
 * Added update checker (Closes #20)

### V1.3.0
 * Changed method of obtaining free games list (Closes #13)
 * Added better logger (Closes #14)

### V1.2.3
 * Small bugfix

### V1.2.2
 * Added looping feature a.k.a. run forever* (Closes #2)
 * Added multi-account support*

*Please update your config accordingly

### V1.2.1
 * Makes `rememberLastSession` optional in config or launch parameter (Closes #8)
 * Added ESLint linter

### V1.2.0
 * Now allows web login, if normal login fails, e.g. due to captcha (Closes #3)

*Please run `npm install` again, to install `epicgames-client-login-adapter`, required to utilize this new feature

### V1.1.2
 * Enables `rememberLastSession` by default* (Closes #4)

*Please run `npm update` to update `epicgames-client`, required to utilize this new feature

### V1.1.1
 * Ensured all search results for all namespaces are purchased

### V1.1.0
 * Added support for email/password arguments
 * Moved saved credentials to config.json
 * Ensured all search results are returned
 * Fixed program not exiting

### V1.0.0
 * Initial release
