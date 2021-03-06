const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const { autoScroll } = require("../utils");
const { setupPuppeteer, closePuppeteer } = require("../setup/puppeteer");

const NUMBER_OF_PAGES = 1;
const TARGET_URL = "https://highlightsfootball.com";

const getPageContent = async (pageUrl, page) => {
  for (let i = 1; i <= NUMBER_OF_PAGES; i = i + 1) {
    if (i === 1) {
      await page.goto(pageUrl, { waitUntil: "networkidle2", timeout: 60*1000 });
    } else {
      await page.waitForSelector(".td-load-more-wrap .td_ajax_load_more ");
      await page.click(".td-load-more-wrap .td_ajax_load_more ");
    }
    await autoScroll(page);
    console.log(`... loaded page ${i}/${NUMBER_OF_PAGES}  ...`);
  }

  const pageContent = await page.content();
  return pageContent;
};

const extractPageContent = async content => {
  const $ = cheerio.load(content);
  const wrapper = $(
    ".td_block_wrap .td_block_inner .td_module_wrap .td-module-meta-info"
  );
  const matchesData = [];

  wrapper.each((index, container) => {
    const $$ = cheerio.load(container);
    const elementTitle = $$(".td-module-title a");
    const league = $$(".td-post-category");
    const timeTag = $$("time");
    matchesData.push({
      title: elementTitle.attr("title") || elementTitle.text(),
      url: elementTitle.attr("href"),
      time: timeTag.attr("datetime"),
      league: league.text()
    });
  });
  return matchesData;
};

const extractAllPosibleVideos = async (page, firstUrl) => {
  await page.goto(firstUrl, { waitUntil: "networkidle2", timeout: 60*1000 });
  const content = await page.content();

  const $ = cheerio.load(content);
  const matchData = [];
  const elementTitle = $("#acp_wrapper #acp_paging_menu li");

  elementTitle.each((index, container) => {
    const $$ = cheerio.load(container);
    const title = $$(".acp_title").text();
    let src;
    let url;
    if (index === 0) {
      src = $("#acp_wrapper .acp_content iframe").attr("src");
      url = firstUrl;
    } else {
      url = $$("a").attr("href");
    }
    matchData.push({
      title,
      url,
      src
    });
  });

  return matchData;
};

const getNextVideo = async (page, url) => {
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60*1000 });
  const content = await page.content();
  const $ = cheerio.load(content);

  return $("#acp_wrapper .acp_content iframe").attr("src");
};

const getMatchDetails = async (page, url) => {
  console.group();

  const matchDetails = await extractAllPosibleVideos(page, url);
  const numberOfVideos = matchDetails.length;
  console.log(`video 1/${numberOfVideos}`);

  for (let i = 0; i < numberOfVideos; i = i + 1) {
    if (!matchDetails[i].src) {
      matchDetails[i].src = await getNextVideo(page, matchDetails[i].url);
      console.log(`video ${i + 1}/${numberOfVideos}`);
    }
  }

  console.groupEnd();
  return matchDetails;
};

const runScrapingAllMatches = async () => {
  console.group();

  const { browser, page } = await setupPuppeteer();

  const targetContent = await getPageContent(TARGET_URL, page);
  const matches = await extractPageContent(targetContent);
  const numberOfMatches = matches.length;

  for (let i = 0; i < numberOfMatches; i = i + 1) {
    console.group();
    matches[i].videos = await getMatchDetails(page, matches[i].url);
    console.log(`... loaded match ${i + 1}/${numberOfMatches}  ...`);
    console.groupEnd();
  }

  await closePuppeteer(browser);

  console.groupEnd();
  return matches;
};

const scrapeAllAvailableMatches = async () => {
  console.group();

  const { browser, page } = await setupPuppeteer();

  const targetContent = await getPageContent(TARGET_URL, page);
  const matches = await extractPageContent(targetContent);

  await closePuppeteer(browser);

  console.groupEnd();
  return matches;
};

const scrapeSingleMatch = async match => {
  console.group();

  const { browser, page } = await setupPuppeteer();
  const { url, title } = match;
  console.log(`Getting match details for: ${title}`);
  const videos = await getMatchDetails(page, url);

  await closePuppeteer(browser);

  console.groupEnd();
  return {
    ...match,
    videos
  };
};

const getNumberOfAvailableVideo = async match => {
  console.group();
  const { browser, page } = await setupPuppeteer();

  const { url, title } = match;
  console.log(`Getting available videos for: ${title}`);
  const videos = await extractAllPosibleVideos(page, url);

  await closePuppeteer(browser);

  console.groupEnd();
  return videos.length;
};

module.exports = {
  runScrapingAllMatches,
  scrapeAllAvailableMatches,
  scrapeSingleMatch,
  getNumberOfAvailableVideo
};
