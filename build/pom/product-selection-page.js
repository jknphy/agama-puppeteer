export class ProductSelectionPage {
    constructor(page) {
        this.page = page;
        this.choseLeap = page.locator("::-p-text('Leap 16.0 Alpha')");
        this.choseMicroOs = page.locator("::-p-text('openSUSE MicroOS')");
        this.choseTumbleweed = page.locator("::-p-text('openSUSE Tumbleweed')");
        this.selectButton = page.locator("button[form='productSelectionForm']");
    }
    async selectLeap() {
        await this.choseLeap.click();
        await this.selectButton.click();
    }
    async selectMicroOs() {
        await this.choseMicroOs.click();
        await this.selectButton.click();
    }
    async selectTumbleweed() {
        await this.choseTumbleweed.click();
        await this.selectButton.click();
    }
}
//# sourceMappingURL=product-selection-page.js.map