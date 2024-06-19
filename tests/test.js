"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var puppeteer_1 = require("puppeteer");
var chai_1 = require("chai");
// helper function for converting String to Boolean
function booleanEnv(name, default_value) {
    var env = process.env[name];
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
// function browserSettings(name: string) {
//   switch (name.toLowerCase()) {
//     case "firefox":
//       return {
//         product: "firefox",
//         executablePath: "/usr/bin/firefox",
//       };
//     case "chrome":
//       return {
//         product: "chrome",
//         executablePath: "/usr/bin/google-chrome-stable",
//       };
//     case "chromium":
//       return {
//         product: "chrome",
//         executablePath: "/usr/bin/chromium",
//       };
//     default:
//       throw new Error(`Unsupported browser type: ${name}`);
//   }
// }
var agamaServer = process.env.AGAMA_SERVER || "http://localhost";
var agamaPassword = process.env.AGAMA_PASSWORD || "linux";
// const agamaBrowser = process.env.AGAMA_BROWSER || "firefox";
var slowMo = parseInt(process.env.AGAMA_SLOWMO) || 0;
var headless = booleanEnv("AGAMA_HEADLESS", true);
describe("Agama test", function () {
    // mocha timeout
    this.timeout(20000);
    var page;
    var browser;
    before(function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, puppeteer_1.default.launch({
                            // "webDriverBiDi" does not work with old FireFox, comment it out if needed
                            protocol: "webDriverBiDi",
                            headless: headless,
                            ignoreHTTPSErrors: true,
                            timeout: 30000,
                            slowMo: slowMo,
                            defaultViewport: {
                                width: 1024,
                                height: 768
                            },
                            // ...browserSettings(agamaBrowser)
                            product: "firefox",
                            executablePath: "/usr/bin/firefox",
                        })];
                    case 1:
                        browser = _a.sent();
                        return [4 /*yield*/, browser.newPage()];
                    case 2:
                        page = _a.sent();
                        page.setDefaultTimeout(20000);
                        return [4 /*yield*/, page.goto(agamaServer, { timeout: 60000, waitUntil: "domcontentloaded" })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    after(function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, page.close()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, browser.close()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    // automatically take a screenshot and dump the page content for failed tests
    afterEach(function () {
        return __awaiter(this, void 0, void 0, function () {
            var dir, name, html;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.currentTest.state === "failed")) return [3 /*break*/, 3];
                        dir = "log";
                        if (!fs.existsSync(dir))
                            fs.mkdirSync(dir);
                        name = path.join(dir, this.currentTest.title.replace(/[^a-zA-Z0-9]/g, "_"));
                        return [4 /*yield*/, page.screenshot({ path: name + ".png" })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, page.content()];
                    case 2:
                        html = _a.sent();
                        fs.writeFileSync(name + ".html", html);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    });
    it("should have Agama page title great", function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = chai_1.expect;
                        return [4 /*yield*/, page.title()];
                    case 1:
                        _a.apply(void 0, [_b.sent()]).to.eql("Agama");
                        return [2 /*return*/];
                }
            });
        });
    });
    // login to remote Agama instances
    it("should have Agama heading", function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, page.waitForSelector("h1::-p-text(Agama)")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    it("allows logging in", function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, page.waitForSelector("input[type='password']")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, page.type("input[type='password']", agamaPassword)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, page.click("button[type='submit']")];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    it("should optionally display the product selection dialog", function () {
        return __awaiter(this, void 0, void 0, function () {
            var productSelectionDisplayed, openSUSE, select;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.any([
                            page.waitForSelector("a[href='#/storage']").then(function () { return false; }),
                            page.waitForSelector("h1::-p-text(Product selection)").then(function () { return true; })
                        ])];
                    case 1:
                        productSelectionDisplayed = _a.sent();
                        if (!productSelectionDisplayed) return [3 /*break*/, 6];
                        return [4 /*yield*/, page.waitForSelector("h3::-p-text('openSUSE Tumbleweed')")];
                    case 2:
                        openSUSE = _a.sent();
                        return [4 /*yield*/, openSUSE.click()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, page.waitForSelector("button::-p-text(Select)")];
                    case 4:
                        select = _a.sent();
                        return [4 /*yield*/, select.click()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        // no product selection displayed, mark the test as skipped
                        this.skip();
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    });
    it("should have a page heading", function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, page.waitForSelector("h1::-p-text('Installation Summary')")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    it("should allow setting the root password", function () {
        return __awaiter(this, void 0, void 0, function () {
            var button, id, change, newPassword, confirm, back;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, page.waitForSelector("a[href='#/users']")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, page.click("a[href='#/users']")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, Promise.any([
                                page.waitForSelector("button::-p-text(Set a password)"),
                                page.waitForSelector("button#actions-for-root-password")
                            ])];
                    case 3:
                        button = _a.sent();
                        return [4 /*yield*/, button.click()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, button.evaluate(function (x) { return x.id; })];
                    case 5:
                        id = _a.sent();
                        if (!(id === "actions-for-root-password")) return [3 /*break*/, 8];
                        return [4 /*yield*/, page.waitForSelector("button[role='menuitem']::-p-text('Change')")];
                    case 6:
                        change = _a.sent();
                        return [4 /*yield*/, change.click()];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        newPassword = "test";
                        return [4 /*yield*/, page.waitForSelector("input#password")];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, page.type("input#password", newPassword)];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, page.type("input#passwordConfirmation", newPassword)];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, page.waitForSelector("button::-p-text(Confirm)")];
                    case 12:
                        confirm = _a.sent();
                        return [4 /*yield*/, confirm.click()];
                    case 13:
                        _a.sent();
                        // wait until the popup disappears from the page, it is blocking the "Back"
                        // button below and clicking it would not have any effect
                        return [4 /*yield*/, page.waitForSelector("div[role='dialog']", { hidden: true })];
                    case 14:
                        // wait until the popup disappears from the page, it is blocking the "Back"
                        // button below and clicking it would not have any effect
                        _a.sent();
                        return [4 /*yield*/, page.waitForSelector("button::-p-text(Back)")];
                    case 15:
                        back = _a.sent();
                        return [4 /*yield*/, back.click()];
                    case 16:
                        _a.sent();
                        // back on the main page
                        return [4 /*yield*/, page.waitForSelector("a[href='#/users']")];
                    case 17:
                        // back on the main page
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
});
//# sourceMappingURL=test.js.map