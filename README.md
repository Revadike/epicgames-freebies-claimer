# EpicGames Freebies Claimer

![image](https://user-images.githubusercontent.com/4411977/74479432-6a6d1b00-4eaf-11ea-930f-1b89e7135887.png)

## Description

Claim [available free game promotions](https://www.epicgames.com/store/free-games) from the Epic Game Store.

## Requirements

- [Node.js](https://nodejs.org/download/)

## Installation

1. Clone repo using `git clone https://github.com/Revadike/epicgames-freebies-claimer` or [download zip](https://github.com/Revadike/epicgames-freebies-claimer/archive/master.zip)
2. Run `npm install` in the project directory

You can also run this automatically using github actions. Why? Because you don't wan't to run your computer 24/7 just to get free games.

To run this using github actions, go to [maximousblk/claim-epic-freebies](https://github.com/maximousblk/claim-epic-freebies) and follow the instructions.

## Running

### Using arguments

- Run `npm start USERNAME PASSWORD 0|1 2FA_SECRET`

`0|1` - If you want it to remember the last session, use `1` otherwise `0`

### Using config file

- Edit `config.json` to include your EpicGames credentials and options.

- Run `npm start`

## FAQ

### Why should I use this?

This is for the truly lazy, you know who you are. ;)
Also, this is a good alternative, in case you don't like using Epic's client or website (and I don't blame you).

### Why should I even bother claiming these free games?

To which I will say, why not? Most of these games are actually outstanding games! Even if you don't like Epic and their shenanigans, you will be pleased to know that Epic actually funds all the free copies that are given away: ["But we actually found it was more economical to pay developers [a lump sum] to distribute their game free for two weeks..."](https://arstechnica.com/gaming/2019/03/epic-ceo-youre-going-to-see-lower-prices-on-epic-games-store/)

### Can I use the looping or multi-account feature when using launch arguments?

No, these are only usable by using the config.
