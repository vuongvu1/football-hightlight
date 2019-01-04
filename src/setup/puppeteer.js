const puppeteer = require('puppeteer');

const PUPPETEER_LAUNCH_OPTIONS = {
    args: ["--lang=en-US", "--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
    // slowMo: 500
  };
const PUPPETEER_PAGE_VIEWPORT = { width: 1366, height: 768 };

const setupPuppeteer = async () => {
    const browser = await puppeteer.launch(PUPPETEER_LAUNCH_OPTIONS);
    const page = await browser.newPage();
    await page.setViewport(PUPPETEER_PAGE_VIEWPORT);
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if ([
        'image',
        'stylesheet',
        'font'
      ].indexOf(request.resourceType()) !== -1) {
        request.abort();
      } else {
        request.continue();
      }
    });
    return { browser, page };
}

const closePuppeteer = (browser) => {
    browser.close();
};

module.exports = {
    setupPuppeteer,
    closePuppeteer
}
