/* eslint-env mocha */
/* globals expect */
"use strict";

import "chai/register-expect.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import gamePromotions from "../src/gamePromotions.js";
import { readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

function readData(name, date = null) {
    let filename = name.replace("/", "_");
    if (date) {
        filename += `_${date}`;
    }
    return JSON.parse(readFileSync(`${__dirname}/data/${filename}.json`).toString());
}

let client = {};
// eslint-disable-next-line
client.getBundleForSlug = async function(slug) { return readData(`bundles_${slug}`, this.date); };
// eslint-disable-next-line
client.getProductForSlug = async function(slug) { return readData(`products_${slug}`, this.date); };

describe("freeGamesPromotions", () => {
    let target = async(date) => {
        client.date = date;
        client.freeGamesPromotions = () => readData("freeGamesPromotions", date);

        return (await gamePromotions.freeGamesPromotions(client))
            .map((o) => ({ "title": o.title, "id": o.id, "namespace": o.namespace }));
    };

    let date = "2020-09-01";
    context(`On ${date}`, () => {
        it("should return current 100% discounted games", async() => {
            let freeGames = await target(date);

            expect(freeGames).to.deep.include({
                "title":     "Shadowrun Collection",
                "id":        "c5cb60ecc6554c6a8d9a682b87ab04bb",
                "namespace": "bd8a7e894699493fb21503837f7b66c5",
            });

            expect(freeGames).to.deep.include({
                "title":     "Hitman 2016",
                "id":        "e8efad3d47a14284867fef2c347c321d",
                "namespace": "3c06b15a8a2845c0b725d4f952fe00aa",
            });

            expect(freeGames).to.have.lengthOf(2);
        });

        it("should not return coming discounted games", async() => {
            let freeGames = await target(date);

            expect(freeGames).to.not.deep.include({ "namespace": "5c0d568c71174cff8026db2606771d96" });
        });

        it("should not return other free games", async() => {
            let freeGames = await target(date);

            expect(freeGames).to.not.deep.include({ "namespace": "d6a3cae34c5d4562832610b5b8664576" });
        });
    });
});
