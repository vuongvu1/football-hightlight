const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { autoScroll } = require('./utils');

const PUPPETEER_LAUNCH_OPTIONS = {
  args: ["--lang=en-US", "--no-sandbox", "--disable-setuid-sandbox"],
  // headless: false,
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

const extractPageContent = async (content) => {
  const wrapperContainer = cheerio.load(content);
  const wrapper = wrapperContainer('.td_block_wrap .td_block_inner .td_module_wrap .td-module-meta-info');
  const matchesData = [];

  wrapper.each((index, container) => {
    const element = cheerio.load(container);
    const elementTitle = element('.td-module-title a');
    const timeTag = element('time');
    matchesData.push({
      index,
      title: elementTitle.attr("title") || elementTitle.text(),
      url: elementTitle.attr("href"),
      time: timeTag.attr("datetime"),
    });
  });
  return matchesData
};

const extractPageDetail = async (content) => {
  const wrapperContainer = cheerio.load(content);
  const wrapper = wrapperContainer('#acp_wrapper');
  const matchData = [];

  wrapper.each((index, container) => {
    const element = cheerio.load(container);
    const elementTitle = element('.acp_title');
    const elementIframe = element('.acp_content iframe');
    matchData.push({
      title: elementTitle.text(),
      src: elementIframe.attr("src"),
    });
  });
  return matchData
};

const getMatchDetails = async (url, page) => {
  await page.goto(url, { waitUnil: 'networkidle2' });
  const pageDetailContent = await page.content();
  const matchDetails = await extractPageDetail(pageDetailContent);

  console.log({ matchDetails });
};

const main = async () => {
  const targetUrl = 'https://highlightsfootball.com';
  const browser = await puppeteer.launch(PUPPETEER_LAUNCH_OPTIONS);
  const page = await browser.newPage();
  await page.setViewport(PUPPETEER_PAGE_VIEWPORT);

  const targetContent = await getPageContent(targetUrl, page);
  const matches = await extractPageContent(targetContent);
  await getMatchDetails(matches[0].url, page);
  // console.log({ matches });

  await browser.close();
}

main();

