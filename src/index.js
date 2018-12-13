const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { autoScroll } = require('./utils');

const PUPPETEER_LAUNCH_OPTIONS = {
  args: ["--lang=en-US", "--no-sandbox", "--disable-setuid-sandbox"],
  // headless: false,
  // slowMo: 500
};
const PUPPETEER_PAGE_VIEWPORT = { width: 1366, height: 768 };
const NUMBER_OF_PAGES = 1;

const getPageContent = async (pageUrl, page) => {
  for (let i = 1; i <= NUMBER_OF_PAGES; i = i + 1) {

    if (i === 1) {
      await page.goto(pageUrl, { waitUntil: 'networkidle2' });
    } else {
      await page.waitForSelector('.td-load-more-wrap .td_ajax_load_more ');
      await page.click('.td-load-more-wrap .td_ajax_load_more ');
    }
    await autoScroll(page);
    console.log(`... loaded page ${i}  ...`);
  }

  const pageContent = await page.content();
  return pageContent;
};

const extractPageContent = async (content) => {
  const $ = cheerio.load(content);
  const wrapper = $('.td_block_wrap .td_block_inner .td_module_wrap .td-module-meta-info');
  const matchesData = [];

  wrapper.each((index, container) => {
    const $$ = cheerio.load(container);
    const elementTitle = $$('.td-module-title a');
    const timeTag = $$('time');
    matchesData.push({
      index,
      title: elementTitle.attr("title") || elementTitle.text(),
      url: elementTitle.attr("href"),
      time: timeTag.attr("datetime"),
    });
  });
  return matchesData
};

const extractAllPosibleVideos = async (page, firstUrl) => {
  await page.goto(firstUrl, { waitUntil: 'networkidle2' });
  const content = await page.content();

  const $ = cheerio.load(content);
  const matchData = [];
  const elementTitle = $('#acp_wrapper #acp_paging_menu li');

  elementTitle.each((index, container) => {
    const $$ = cheerio.load(container);
    const title = $$('.acp_title').text();
    let src;
    let url;
    if (index === 0) {
      src = $('#acp_wrapper .acp_content iframe').attr("src");
      url = firstUrl;
    } else {
      url = $$('a').attr("href");
    }
    matchData.push({
      title,
      url,
      src,
    });
  });

  return matchData
};

const getNextVideo = async (page, url) => {
  await page.goto(url, { waitUntil: 'networkidle2' });
  const content = await page.content();
  const $ = cheerio.load(content);

  return $('#acp_wrapper .acp_content iframe').attr("src");
};

const getMatchDetails = async (page, url) => {
  const matchDetails = await extractAllPosibleVideos(page, url);
  console.log(`video 1`);

  for (let i = 0; i < matchDetails.length; i = i + 1) {
    if (!matchDetails[i].src) {
      matchDetails[i].src = await getNextVideo(page, matchDetails[i].url);
      console.log(`video ${i + 1}`);
    }
  }

  return matchDetails;
};

const main = async () => {
  console.time('---APP---');
  const targetUrl = 'https://highlightsfootball.com';
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

  const targetContent = await getPageContent(targetUrl, page);
  const matches = await extractPageContent(targetContent);

  for (let i = 0; i < matches.length; i = i + 1) {
    matches[i].videos = await getMatchDetails(page, matches[i].url);
    console.log(`... loaded match ${i + 1}  ...`);
  }

  await browser.close();
  console.timeEnd('---APP---');
}

main();

