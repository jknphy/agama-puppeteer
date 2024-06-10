import fs from "fs";
import path from "path";

import puppeteer from "puppeteer";
import { expect } from "chai";

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
const agamaPassword = process.env.AGAMA_PASSWORD || "linux";
const agamaBrowser = process.env.AGAMA_BROWSER || "firefox";
const slowMo = parseInt(process.env.AGAMA_SLOWMO) || 0;
const headless = booleanEnv("AGAMA_HEADLESS", true);

describe("Agama test", function () {
  // mocha timeout
  this.timeout(20000);

  let page;
  let browser;

  before(async function () {
    browser = await puppeteer.launch({
      // "webDriverBiDi" does not work with old FireFox, comment it out if needed
      protocol: "webDriverBiDi",
      headless,
      ignoreHTTPSErrors: true,
      timeout: 30000,
      slowMo,
      defaultViewport: {
        width: 1024,
        height: 768
      },
      ...browserSettings(agamaBrowser)
    });
    page = await browser.newPage();
    page.setDefaultTimeout(20000);
    await page.goto(agamaServer, { timeout: 60000, waitUntil: "domcontentloaded" });
  });

  after(async function () {
    await page.close();
    await browser.close();
  })

  // automatically take a screenshot and dump the page content for failed tests
  afterEach(async function () {
    if (this.currentTest.state === "failed") {
      // directory for storing the data
      const dir = "log";
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);

      // base file name for the dumps
      const name = path.join(dir, this.currentTest.title.replace(/[^a-zA-Z0-9]/g, "_"));
      await page.screenshot({ path: name + ".png" });
      const html = await page.content();
      fs.writeFileSync(name + ".html", html);
    }
  });

  it("should have Agama page title super dupi dupi", async function () {
    expect(await page.title()).to.eql("Agama");
  });

  // login to remote Agama instances
  it("should have Agama heading", async function () {
    await page.waitForSelector("h1::-p-text(Agama)");
  });

  it("allows logging in", async function () {
    await page.waitForSelector("input[type='password']");
    await page.type("input[type='password']", agamaPassword);
    await page.click("button[type='submit']");
  });

  it("should optionally display the product selection dialog", async function () {
    // Either the main page is displayed (with the storage link) or there is
    // the product selection page.
    let productSelectionDisplayed = await Promise.any([
      page.waitForSelector("a[href='#/storage']").then(() => false),
      page.waitForSelector("h1::-p-text(Product selection)").then(() => true)
    ]);

    if (productSelectionDisplayed) {
      const openSUSE = await page.waitForSelector("h3::-p-text('openSUSE Tumbleweed')");
      await openSUSE.click();
      const select = await page.waitForSelector("button::-p-text(Select)");
      await select.click();
    } else {
      // no product selection displayed, mark the test as skipped
      this.skip();
    }
  });

  it("should have a page heading", async function () {
    await page.waitForSelector("h1::-p-text('Installation Summary')");
  });

  it("should allow setting the root password", async function () {
    await page.waitForSelector("a[href='#/users']");
    await page.click("a[href='#/users']");

    let button = await Promise.any([
      page.waitForSelector("button::-p-text(Set a password)"),
      page.waitForSelector("button#actions-for-root-password")
    ]);

    await button.click();

    const id = await button.evaluate(x => x.id);
    // if the menu button was clicked we need to additionally press the "Change" menu item
    if (id === "actions-for-root-password") {
      const change = await page.waitForSelector("button[role='menuitem']::-p-text('Change')");
      await change.click();
    }

    const newPassword = "test";
    await page.waitForSelector("input#password");
    await page.type("input#password", newPassword);
    await page.type("input#passwordConfirmation", newPassword);

    const confirm = await page.waitForSelector("button::-p-text(Confirm)");
    await confirm.click();

    // wait until the popup disappears from the page, it is blocking the "Back"
    // button below and clicking it would not have any effect
    await page.waitForSelector("div[role='dialog']", { hidden: true });

    const back = await page.waitForSelector("button::-p-text(Back)");
    await back.click();

    // back on the main page
    await page.waitForSelector("a[href='#/users']");
  });
});
