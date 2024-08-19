export class LoginAsRootPage {
    constructor(page) {
        this.page = page;
        this.passwordInput = page.locator("input#password");
        this.logInButton = page.locator("button[type='submit']");
    }
    async logIn(password) {
        await this.passwordInput.fill(password);
        await this.logInButton.click();
    }
}
//# sourceMappingURL=login-as-root-page.js.map