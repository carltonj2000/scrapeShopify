const puppeteer = require("puppeteer");
const fs = require("fs-extra");

(async function main() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
    );
    await page.goto("https://experts.shopify.com/");
    await page.waitForSelector(".section");
    let sections = await page.$$(".section");

    await fs.writeFile("out.csv", "name,section\n");

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const button = await section.$("a.marketing-button");
      const buttonName = await page.evaluate(
        button => button.innerText,
        button
      );
      button.click();
      await page.waitForSelector("#ExpertsResults");
      const lis = await page.$$("#ExpertsResults > li");
      for (const li of lis) {
        const name = await li.$eval("h2", h2 => h2.innerText);
        await fs.appendFile("out.csv", `${buttonName},${name}\n`);
      }
      await page.goto("https://experts.shopify.com/");
      await page.waitForSelector(".section");
      sections = await page.$$(".section");
    }
    await browser.close();
  } catch (e) {
    console.log("cj err", e);
  }
})();
