import { LoginAsRootPage } from "../pom/login-as-root-page.js";
import { ProductSelectionPage } from "../pom/product-selection-page.js";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";
import { expect } from "chai";
// This is an example file for running Agama integration tests using Puppeteer.
//
// If the test fails it saves the page screenshot and the HTML page dump to
// ./log/ subdirectory.
// For more details about customization see the README.md file.
// helper function for converting String to Boolean
function booleanEnv(name, default_value) {
    const env = process.env[name];
    if (env === undefined) {
        return default_value;
    }
    switch (env.toLowerCase()) {
        case "0":
        case "false":
        case "off":
        case "disabled":
        case "no":
            return false;
        case "1":
        case "true":
        case "on":
        case "enabled":
        case "yes":
            return true;
        default:
            return default_value;
    }
}
// helper function for configuring the browser
function browserSettings(name) {
    switch (name.toLowerCase()) {
        case "firefox":
            return {
                product: "firefox",
                executablePath: "/usr/bin/firefox",
            };
        case "chrome":
            return {
                product: "chrome",
                executablePath: "/usr/bin/google-chrome-stable",
            };
        case "chromium":
            return {
                product: "chrome",
                executablePath: "/usr/bin/chromium",
            };
        default:
            throw new Error(`Unsupported browser type: ${name}`);
    }
}
const agamaServer = process.env.AGAMA_SERVER || "http://localhost";
const agamaPassword = process.env.AGAMA_PASSWORD || "nots3cr3t";
const agamaBrowser = process.env.AGAMA_BROWSER || "firefox";
const agamaSlowMo = parseInt(process.env.AGAMA_SLOWMO || '0');
const agamaHeadless = booleanEnv("AGAMA_HEADLESS", true);
const agamaInstall = booleanEnv("AGAMA_INSTALL", true);
const agamaUser = "bernhard";
const agamaUserFullName = "Bernhard M. Wiedemann";
const agamaUserPassword = "nots3cr3t";
describe("Agama test", function () {
    // mocha timeout
    this.timeout(20000);
    let page;
    let browser;
    before(async function () {
        browser = await puppeteer.launch({
            // "webDriverBiDi" does not work with old FireFox, comment it out if needed
            protocol: "webDriverBiDi",
            headless: agamaHeadless,
            ignoreHTTPSErrors: true,
            timeout: 30000,
            slowMo: agamaSlowMo,
            defaultViewport: {
                width: 1200,
                height: 768
            },
            ...browserSettings(agamaBrowser),
        });
        page = await browser.newPage();
        page.setDefaultTimeout(20000);
        await page.goto(agamaServer, { timeout: 60000, waitUntil: "domcontentloaded" });
    });
    after(async function () {
        //  await page.close();
        //    await browser.close();
    });
    // automatically take a screenshot and dump the page content for failed tests
    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            // directory for storing the data
            const dir = "log";
            if (!fs.existsSync(dir))
                fs.mkdirSync(dir);
            // base file name for the dumps
            const name = path.join(dir, this.currentTest.title.replace(/[^a-zA-Z0-9]/g, "_"));
            await page.screenshot({ path: name + ".png" });
            const html = await page.content();
            fs.writeFileSync(name + ".html", html);
        }
    });
    it("should have Agama page title", async function () {
        expect(await page.title()).to.eql("Agama");
    });
    it("allows logging in", async function () {
        let loginAsRoot = new LoginAsRootPage(page);
        loginAsRoot.logIn(agamaPassword);
    });
    it("should optionally display the product selection dialog", async function () {
        let timeout = 2 * 60 * 1000;
        this.timeout(timeout);
        // Either the main page is displayed (with the storage link) or there is
        // the product selection page.
        let productSelectionDisplayed = await Promise.any([
            page.waitForSelector("a[href='#/storage']")
                .then(s => { s.dispose(); return false; }),
            page.waitForSelector("button[form='productSelectionForm']")
                .then(s => { s.dispose(); return true; })
        ]);
        if (productSelectionDisplayed) {
            let productSelection = new ProductSelectionPage(page);
            productSelection.selectTumbleweed();
        }
    });
});
//# sourceMappingURL=pom-install.js.map