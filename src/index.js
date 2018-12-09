const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { autoScroll } = require('./utils');

const PUPPETEER_LAUNCH_OPTIONS = {
  args: ["--lang=en-US", "--no-sandbox", "--disable-setuid-sandbox"],
  headless: false,
  // slowMo: 500 
};
const PUPPETEER_PAGE_VIEWPORT = { width: 1366, height: 768 };
const LOAD_MORE_TIME = 5;

const getPageContent = async (pageUrl) => {
  const browser = await puppeteer.launch(PUPPETEER_LAUNCH_OPTIONS);
  const page = await browser.newPage();
  await page.setViewport(PUPPETEER_PAGE_VIEWPORT);
  await page.goto(pageUrl);

  await autoScroll(page);
  console.log('load page 1 completed');

  for (let i = 1; i < LOAD_MORE_TIME; i = i + 1) {
    await page.waitForSelector('.td-load-more-wrap .td_ajax_load_more ');
    await page.click('.td-load-more-wrap .td_ajax_load_more ');
    await autoScroll(page);
    console.log(`load page ${i + 1} completed`);
  }

  const pageContent = await page.content();
  await browser.close();
  return pageContent;
};

const extractPageContent = async (pageContent) => {
  const pageElementHandler = cheerio.load(pageContent);
  const allMatchesContainer = pageElementHandler('.td_block_wrap .td_block_inner .td_module_wrap .td-module-meta-info .td-module-title');
  const matchesData = [];

  allMatchesContainer.each((index, container) => {
    const element = cheerio.load(container);
    const elementTitle = element('a');
    matchesData.push(
      {
        index,
        title: elementTitle.attr("title") || elementTitle.text(),
        url: elementTitle.attr("href"),
      }
    );
  });
  return matchesData
};

const main = async () => {
  const targetUrl = 'https://highlightsfootball.com';
  const targetContent = await getPageContent(targetUrl);
  const matches = await extractPageContent(targetContent);
  console.log({ total: matches.length });
}

main();

