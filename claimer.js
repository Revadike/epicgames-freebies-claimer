"use strict";
const CheckUpdate = require("check-update-github");
const Config = require(`${__dirname}/config.json`);
const Logger = require("tracer").console(`${__dirname}/logger.js`);
const Package = require("./package.json");
const Puppeteer = require("puppeteer");
const TwoFactor = require("node-2fa");

const LOGIN_URL = "https://www.epicgames.com/id/login?redirectUrl=https%3A%2F%2Fwww.epicgames.com%2Fstore%2Ffree-games";
const LOGOUT_URL = "https://www.epicgames.com/logout";

function isUpToDate() {
    return new Promise((res, rej) => {
        CheckUpdate({
            "name":           Package.name,
            "currentVersion": Package.version,
            "user":           "revadike",
            "branch":         "puppeteer"
        }, (err, latestVersion) => {
            if (err) {
                rej(err);
            } else {
                res(latestVersion === Package.version);
            }
        });
    });
}

async function claimGame(browser, link) {
    let purchasePage = await browser.newPage();
    await Promise.all([
        purchasePage.waitFor("[class*=\"PurchaseButton-\"] button"),
        await purchasePage.goto(link)
    ]);

    let purchaseDisabled
     = await purchasePage.$eval("[class*=\"PurchaseButton-\"] button[disabled]", node => Boolean(node)).catch(() => false);
    if (purchaseDisabled) {
        await purchasePage.close();
        return;
    }

    await Promise.all([
        purchasePage.waitFor(".confirm-container button"),
        purchasePage.click("[class*=\"PurchaseButton-\"] button")
    ]);

    let confirmPrompt = await purchasePage.$eval(".overlay-container.open", node => Boolean(node)).catch(() => false);
    if (confirmPrompt) {
        await Promise.all([
            purchasePage.waitFor(".overlay-container.open"),
            purchasePage.click(".confirm-container button")
        ]);
        await Promise.all([
            purchasePage.waitForNavigation({ "waitUntil": "networkidle2" }),
            purchasePage.click(".overlay-container.open .btn-primary")
        ]);
    } else {
        await Promise.all([
            purchasePage.waitForNavigation({ "waitUntil": "networkidle2" }),
            purchasePage.click(".confirm-container button")
        ]);
    }
    await purchasePage.close();
}

(async() => {
    if (!await isUpToDate()) {
        Logger.warn(`There is a new version available: ${Package.url}`);
    }

    let { accounts, delay, loop } = Config;
    let browser = await Puppeteer.launch({ "headless": false });
    let sleep = delay => new Promise(res => setTimeout(res, delay * 60000));
    do {
        if (process.argv.length > 2) {
            loop = false;
            accounts = [{
                "email":               process.argv[2],
                "password":            process.argv[3],
                "rememberLastSession": Boolean(Number(process.argv[4])),
                "secret":              process.argv[5],
            }];
        }

        for (let account of accounts) {
            let { email, password, rememberLastSession, twoFactorCode, secret } = account;
            let hasSecret = secret && secret.length > 0;
            if (hasSecret) {
                let { token } = TwoFactor.generateToken(secret);
                twoFactorCode = token;
            }
            let loginPage = await browser.newPage();
            await Promise.all([
                loginPage.waitFor("#login-with-epic"),
                loginPage.goto(LOGIN_URL)
            ]);
            await Promise.all([
                loginPage.waitFor("#email"),
                loginPage.click("#login-with-epic")
            ]);
            await loginPage.type("#email", email);
            await loginPage.type("#password", password);
            await loginPage.$eval("#rememberMe", input => { input.checked = true; });
            await Promise.all([
                loginPage.waitForNavigation({ "waitUntil": "networkidle2" }),
                loginPage.click("#login")
            ]);

            // TODO
            // let loginFail = await loginPage.$("h6.Error")
            // let captchaPrompt = await loginPage.$("#");
            // let 2faPrompt = await loginPage.$("#");

            let displayName = await loginPage.$eval("#user .display-name", node => node.innerText);
            Logger.info(`Logged in as ${displayName}`);

            let freePromos = await loginPage.$$eval("a",
                links => links.filter(e => Boolean(e.querySelector("img"))).map(link => link.href));
            let promises = [...new Set(freePromos)].map(link => () => claimGame(browser, link));
            await Promise.all(promises.map(f => f()));

            await loginPage.goto(LOGOUT_URL);
            Logger.info(`Logged ${displayName} out of Epic Games`);
        }

        if (loop) {
            Logger.info(`Waiting ${delay} minutes`);
            await sleep(delay);
        } else {
            process.exit(0);
        }
    } while (loop);
})().catch(err => {
    Logger.error(err);
    process.exit(1);
});
