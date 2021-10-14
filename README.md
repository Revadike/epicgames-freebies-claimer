# EpicGames Freebies Claimer
![image](https://user-images.githubusercontent.com/4411977/74479432-6a6d1b00-4eaf-11ea-930f-1b89e7135887.png)

## Description
Claim [available free game promotions](https://www.epicgames.com/store/free-games) from the Epic Games Store.

## Requirements
 * [DeviceAuthGenerator](https://github.com/xMistt/DeviceAuthGenerator/releases)
 * [Git](https://git-scm.com/downloads)
 * [Node.js](https://nodejs.org/download/) (with build tools checked)

## Instructions - Quick
0. (Optional) ☆ Star this project :)
1. Download/clone this repository
2. Run `npm install`
3. Generate `device_auths.json` (using [DeviceAuthGenerator](https://github.com/xMistt/DeviceAuthGenerator))
4. (Optional) Edit `config.json`
5. Run `npm start`

## Instructions - Detailed
Check out the [wiki](https://github.com/Revadike/epicgames-freebies-claimer/wiki), written by @lucifudge.

## Instructions - Docker
Check out the [wiki](https://github.com/Revadike/epicgames-freebies-claimer/wiki/User-Guide-(Docker)), written by @jackblk.

## FAQ
### Why should I use this?
This is for the truly lazy, you know who you are. ;)
Also, this is a good alternative, in case you don't like using Epic's client or website (and I don't blame you).

### Why should I even bother claiming these free games?
To which I will say, why not? Most of these games are actually outstanding games! Even if you don't like Epic and their shenanigans, you will be pleased to know that Epic actually funds all the free copies that are given away:  ["But we actually found it was more economical to pay developers [a lump sum] to distribute their game free for two weeks..."](https://arstechnica.com/gaming/2019/03/epic-ceo-youre-going-to-see-lower-prices-on-epic-games-store/)

## Changelog
### V1.5.5
 * Fixed testing (#137)
 * Fixed getting slug (for addons) (#134 #135 #136)
### V1.5.4
 * Create data directory to improve k8s convenience (#123)
 * Added optional Pushbullet notifications, if `pushbulletApiKey` option is present in `config.json` (#131)

### V1.5.3
 * Fixed missing history.json

### V1.5.2
 * Fixed a looping issue

### V1.5.1
 * Added docker support (#105)
 * Fixed getting wrong offer (#107 #108)
 * No longer logs in to check for new freebies (#109)
 * Keep track of claimed freebies history (#110)

### V1.5.0
 * Fixed login
 * Fixed purchase (claiming)
 * Removed ownership check (broken)
 * Removed unneeded dependencies
 * Code restyling

### V1.4.1
 * Removed the need for graphql query

### V1.4.0
 * Added two factor authentication (2fa) support while EpicGames changed policy (#17 #19 #21)
 * Added update checker (#20)

### V1.3.0
 * Changed method of obtaining free games list (#13)
 * Added better logger (#14)

### V1.2.3
 * Small bugfix

### V1.2.2
 * Added looping feature a.k.a. run forever* (#2)
 * Added multi-account support*

*Please update your config accordingly

### V1.2.1
 * Makes `rememberLastSession` optional in config or launch parameter (#8)
 * Added ESLint linter

### V1.2.0
 * Now allows web login, if normal login fails, e.g. due to captcha (#3)

*Please run `npm install` again, to install `epicgames-client-login-adapter`, required to utilize this new feature

### V1.1.2
 * Enables `rememberLastSession` by default* (#4)

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

## Happy Freebie Claiming!
![image](https://user-images.githubusercontent.com/4411977/122922274-bb263b00-d363-11eb-8b82-8a3ed6e7e29d.png)
