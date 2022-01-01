"use strict";

const { execFileSync } = require("child_process");
const { unlink, writeFile } = require("fs").promises;
const { "Client": EpicGames } = require("fnbr");
const Logger = require("tracer").console(`${__dirname}/logger.js`);

let DeviceAuths = {};
try {
    DeviceAuths = require(`${__dirname}/data/device_auths.json`);
    unlink(`${__dirname}/data/device_auths.json`);
    writeFile(`${__dirname}/data/deviceAuths.json`, JSON.stringify(DeviceAuths, null, 4));
} catch (error) { /* No device_auths.json */ }
try {
    DeviceAuths = require(`${__dirname}/data/deviceAuths.json`);
} catch (error) { /* No deviceAuths.json */ }

// eslint-disable-next-line max-len
const AUTH_URL = "https://www.epicgames.com/id/logout?redirectUrl=https%3A//www.epicgames.com/id/login%3FredirectUrl%3Dhttps%253A%252F%252Fwww.epicgames.com%252Fid%252Fapi%252Fredirect%253FclientId%253D3446cd72694c4a4485d81b77adbb2141%2526responseType%253Dcode";

function commands() {
    let { platform } = process;
    switch (platform) {
        case "android":
        case "linux":
            return ["xdg-open"];
        case "darwin":
            return ["open"];
        case "win32":
            return ["cmd", ["/c", "start"] ];
        default:
            throw new Error(`Platform ${platform} isn't supported.`);
    }
}

function open(url) {
    return new Promise((resolve, reject) => {
        try {
            const [command, args = []] = commands();
            execFileSync(
                command,
                [...args, url],
            );
            return resolve();
        } catch (error) {
            return reject(error);
        }
    });
}

function printAccounts() {
    Logger.info("Your accounts:");
    let emails = Object.keys(DeviceAuths);
    for (let i = 0; i < emails.length; i++) {
        Logger.info(`${i + 1}) ${emails[i]}`);
    }
    return emails;
}

function printModes() {
    printAccounts();
    Logger.info("");
    Logger.info("Available modes:");
    Logger.info("1) Add account");
    Logger.info("2) Remove account");
    Logger.info("0) Exit");
    Logger.info("");
}

async function selectMode() {
    printModes();

    let mode = await EpicGames.consoleQuestion("Please select a mode (0-2): ");
    switch (Number(mode)) {
        case 0:
            process.exit();
            break;

        case 1:
            // eslint-disable-next-line no-use-before-define
            addAccount();
            break;

        case 2:
            // eslint-disable-next-line no-use-before-define
            removeAccount();
            break;

        default:
            Logger.error("Invalid mode, please choose 1 or 2");
            selectMode();
            break;
    }
}

async function saveDeviceAuth(email, deviceAuth) {
    if (!email) {
        throw new Error("Found no email in account!");
    }

    DeviceAuths[email] = deviceAuth;
    await writeFile(`${__dirname}/data/deviceAuths.json`, JSON.stringify(DeviceAuths, null, 4));
    Logger.info(`Successfully added account: ${email}`);
    Logger.info("");
    selectMode();
}

function addAccount() {
    open(AUTH_URL).catch(() => Logger.info(`Failed to open: ${AUTH_URL}. Please open it manually.`));
    let auth = { "authorizationCode": () => EpicGames.consoleQuestion("Please enter an authorization code: ") };
    let debug = false;
    let client = new EpicGames({ auth, debug });
    let deviceAuth = null;
    let saveIfPossible = () => {
        if (client.user && client.user.email && deviceAuth) {
            let { email } = client.user;
            saveDeviceAuth(email, deviceAuth);
            client.logout();
        }
    };

    client.on("ready", () => saveIfPossible());
    client.on("deviceauth:created", (da) => {
        deviceAuth = da;
        saveIfPossible();
    });

    client.login();
}

async function removeAccount() {
    let emails = printAccounts();
    Logger.info("0) Cancel");
    Logger.info("");
    let i = await EpicGames.consoleQuestion(`Please select an account to delete (0-${emails.length}): `);
    if (Number(i) === 0) {
        selectMode();
        return;
    }

    let email = emails[i - 1];
    if (!email) {
        Logger.error("Invalid number, please choose a valid account");
        removeAccount();
        return;
    }

    delete DeviceAuths[email];
    await writeFile(`${__dirname}/data/deviceAuths.json`, JSON.stringify(DeviceAuths, null, 4));
    Logger.info(`Successfully removed account: ${email}`);
    Logger.info("");
    selectMode();
}

function start() {
    Logger.info("Welcome to account management");
    Logger.info("");
    selectMode();
}

start();
