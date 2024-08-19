import puppeteer, { Puppeteer, type Locator, type Page } from "puppeteer-core";
import { expect } from "chai";

export class LoginAsRootPage {
    readonly page: Page;
    readonly passwordInput: Locator<Element>;
    readonly logInButton: Locator<Element>;

    constructor(page: puppeteer.Page) {
        this.page = page;
        this.passwordInput = page.locator("input#password");
        this.logInButton = page.locator("button[type='submit']");
    }

    async logIn(password: string) {
        await this.passwordInput.fill(password);
        await this.logInButton.click();
    }
}