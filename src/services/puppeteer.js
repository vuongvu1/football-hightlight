const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { autoScroll } = require('../utils');
const { setupPuppeteer, closePuppeteer } = require('../setup/puppeteer');

const NUMBER_OF_PAGES = 1;
const TARGET_URL = 'https://highlightsfootball.com';

const getPageContent = async (pageUrl, page) => {
  for (let i = 1; i <= NUMBER_OF_PAGES; i = i + 1) {

    if (i === 1) {
      await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 0 });
    } else {
      await page.waitForSelector('.td-load-more-wrap .td_ajax_load_more ');
      await page.click('.td-load-more-wrap .td_ajax_load_more ');
    }
    await autoScroll(page);
    console.log(`... loaded page ${i}/${NUMBER_OF_PAGES}  ...`);
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
  await page.goto(firstUrl, { waitUntil: 'networkidle2', timeout: 0 });
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
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
  const content = await page.content();
  const $ = cheerio.load(content);

  return $('#acp_wrapper .acp_content iframe').attr("src");
};

const getMatchDetails = async (page, url) => {
  const matchDetails = await extractAllPosibleVideos(page, url);
  const numberOfVideos = matchDetails.length;
  console.log(`video 1/${numberOfVideos}`);

  for (let i = 0; i < numberOfVideos; i = i + 1) {
    if (!matchDetails[i].src) {
      matchDetails[i].src = await getNextVideo(page, matchDetails[i].url);
      console.log(`video ${i + 1}/${numberOfVideos}`);
    }
  }

  return matchDetails;
};

const runScrapingAllMatches = async () => {
  const { browser, page } = await setupPuppeteer();

  const targetContent = await getPageContent(TARGET_URL, page);
  const matches = await extractPageContent(targetContent);
  const numberOfMatches = matches.length;

  for (let i = 0; i < numberOfMatches; i = i + 1) {
    matches[i].videos = await getMatchDetails(page, matches[i].url);
    console.log(`... loaded match ${i + 1}/${numberOfMatches}  ...`);
  }

  await closePuppeteer(browser);
  return matches;
}

const scrapeAllAvailableMatches = async () => {
  const { browser, page } = await setupPuppeteer();

  const targetContent = await getPageContent(TARGET_URL, page);
  const matches = await extractPageContent(targetContent);

  await closePuppeteer(browser);
  return matches;
}

const scrapeSingleMatch = async (match) => {
  const { browser, page } = await setupPuppeteer();

  const { url, title } = match;
  console.log(`Getting match details for: ${title}`);
  const matches = await getMatchDetails(page, url);

  await closePuppeteer(browser);
  return matches;
}

module.exports = {
  runScrapingAllMatches,
  scrapeAllAvailableMatches,
  scrapeSingleMatch
}
