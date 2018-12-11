const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { autoScroll } = require('./utils');

const PUPPETEER_LAUNCH_OPTIONS = {
  args: ["--lang=en-US", "--no-sandbox", "--disable-setuid-sandbox"],
  headless: false,
  // slowMo: 500 
};
const PUPPETEER_PAGE_VIEWPORT = { width: 1366, height: 768 };
const LOAD_MORE_TIME = 3;

const getPageContent = async (pageUrl, page) => {
  

  for (let i = 1; i < LOAD_MORE_TIME; i = i + 1) {
    if (i === 1) {
      await page.goto(pageUrl, { waitUntil: 'networkidle2' });
    } else {
      await page.waitForSelector('.td-load-more-wrap .td_ajax_load_more ');
      await page.click('.td-load-more-wrap .td_ajax_load_more ');
    }
    await autoScroll(page);
    console.log(`load page ${i} completed`);
  }

  const pageContent = await page.content();
  return pageContent;
};

const extractPageContent = async (pageContent) => {
  const pageElementHandler = cheerio.load(pageContent);
  const allMatchesContainer = pageElementHandler('.td_block_wrap .td_block_inner .td_module_wrap .td-module-meta-info .td-module-title');
  const matchesData = [];

  allMatchesContainer.each((index, container) => {
    const element = cheerio.load(container);
    const elementTitle = element('a');
    matchesData.push({
      index,
      title: elementTitle.attr("title") || elementTitle.text(),
      url: elementTitle.attr("href"),
    });
  });
  return matchesData
};

const getMatchDetails = async (url, page) => {
  console.log(url);
  await page.goto(url, { waitUnil: 'networkidle2' });
};

const main = async () => {
  const targetUrl = 'https://highlightsfootball.com';
  const browser = await puppeteer.launch(PUPPETEER_LAUNCH_OPTIONS);
  const page = await browser.newPage();
  await page.setViewport(PUPPETEER_PAGE_VIEWPORT);

  const targetContent = await getPageContent(targetUrl, page);
  const matches = await extractPageContent(targetContent);
  await getMatchDetails(matches[0].url, page);

  await browser.close();
}

main();

