import * as fs from 'fs';
import * as path from 'path';

import * as puppeteer from 'puppeteer';
import { expect } from 'chai';

// helper function for converting String to Boolean
function booleanEnv(name: string, default_value: boolean) {
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

type BrowserSettings = {
  product: puppeteer.Product;
  executablePath: string;
}

// helper function for configuring the browser
function browserSettings(name: string): BrowserSettings {
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
const slowMo = parseInt(process.env.AGAMA_SLOWMO || '0');
const headless = booleanEnv("AGAMA_HEADLESS", true);

describe("Agama test", function () {
  // mocha timeout
  this.timeout(10000);

  let page: puppeteer.Page;
  let browser: puppeteer.Browser;

  before(async function () {
    browser = await puppeteer.launch({
      // "webDriverBiDi" does not work with old FireFox, comment it out if needed
      protocol: "webDriverBiDi",
      headless,
      ignoreHTTPSErrors: true,
      timeout: 30000,
      slowMo,
      defaultViewport: {
        width: 1200,
        height: 768
      },
      ...browserSettings(agamaBrowser)
    });
    page = await browser.newPage();
    page.setDefaultTimeout(30000);
    await page.goto(agamaServer, { timeout: 60000, waitUntil: "domcontentloaded" });
  });

  after(async function () {
    await page.close();
    await browser.close();
  })

  // automatically take a screenshot and dump the page content for failed tests
  afterEach(async function () {
    if (this.currentTest!.state === "failed") {
      // directory for storing the data
      const dir = "log";
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);

      // base file name for the dumps
      const name = path.join(dir, this.currentTest!.title.replace(/[^a-zA-Z0-9]/g, "_"));
      await page.screenshot({ path: name + ".png" });
      const html = await page.content();
      fs.writeFileSync(name + ".html", html);
    }
  });

  it("should have Agama page title", async function () {
    expect(await page.title()).to.eql("Agama");
  });

  it("allows logging in", async function () {
    await page.locator("input[type='password']").fill(agamaPassword);
    await page.locator("button::-p-text(Log in)").click();
  });

  it("should optionally display the product selection dialog", async function () {
    // Either the main page is displayed (with the storage link) or there is
    // the product selection page.
    let productSelectionDisplayed = await Promise.any([
      page.locator("a[href='#/storage']").wait().then(() => false),
      page.locator("#productSelectionForm").wait().then(() => true)
    ]);

    if (productSelectionDisplayed) {
      await page.locator("input[type='radio'] + label::-p-text(openSUSE MicroOS)").click();
      await page.locator("button::-p-text(Select)").click();
    } else {
      // no product selection displayed, mark the test as skipped
      this.skip();
    }
  });

  it("should have an Overview section", async function () {
    await page.locator("h3::-p-text('Overview')").wait();
  });

  it("should allow setting the root password", async function () {
    await page.locator("a[href='#/users']").click();

    let button = await Promise.any([
      page.waitForSelector("button::-p-text(Set a password)"),
      page.waitForSelector("button#actions-for-root-password")
    ]);
    await button!.click();

    const id = (await button!.getProperty("id")).toString();
    // if the menu button was clicked we need to additionally press the "Change" menu item
    if (id === "actions-for-root-password") {
      await page.locator("button[role='menuitem']::-p-text('Change')").click();
    }

    const newPassword = "test";
    await page.locator("input#password").fill(newPassword);
    await page.locator("input#passwordConfirmation").fill(newPassword);

    await page.locator("button::-p-text(Confirm)").click();
  });

  it("should be ready for installation", async function () {
    await page.locator("a[href='#/overview']").click();
    await page.locator("h4::-p-text('Ready for installation')").wait();
    await page.locator("button::-p-text(Install)").wait();
  });
});
