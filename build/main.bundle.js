'use strict';

var puppeteer = require('puppeteer');
var cheerio = require('cheerio');

var _require = require('./utils'),
    autoScroll = _require.autoScroll;

var PUPPETEER_LAUNCH_OPTIONS = {
  args: ["--lang=en-US", "--no-sandbox", "--disable-setuid-sandbox"],
  headless: false
  // slowMo: 500 
};
var PUPPETEER_PAGE_VIEWPORT = { width: 1366, height: 768 };
var LOAD_MORE_TIME = 5;

var getPageContent = async function getPageContent(pageUrl) {
  var browser = await puppeteer.launch(PUPPETEER_LAUNCH_OPTIONS);
  var page = await browser.newPage();
  await page.setViewport(PUPPETEER_PAGE_VIEWPORT);
  await page.goto(pageUrl);
  await autoScroll(page);

  for (var i = 1; i < LOAD_MORE_TIME; i + 1) {
    await page.waitForSelector('.td-load-more-wrap .td_ajax_load_more ');
    await page.click('.td-load-more-wrap .td_ajax_load_more ');
    await autoScroll(page);
  }

  var pageContent = await page.content();
  await browser.close();
  return pageContent;
};

var extractPageContent = async function extractPageContent(pageContent) {
  var pageElementHandler = cheerio.load(pageContent);
  var allMatchesContainer = pageElementHandler('.td_block_wrap .td_block_inner .td_module_wrap .td-module-meta-info .td-module-title');
  var matchesData = [];

  allMatchesContainer.each(function (index, container) {
    var element = cheerio.load(container);
    var elementTitle = element('a');
    matchesData.push({
      index: index,
      title: elementTitle.attr("title") || elementTitle.text(),
      url: elementTitle.attr("href")
    });
  });
  return matchesData;
};

var main = async function main() {
  var targetUrl = 'https://highlightsfootball.com';
  var targetContent = await getPageContent(targetUrl);
  var matches = await extractPageContent(targetContent);
  console.log({ matches: matches });
};

main();
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var autoScroll = exports.autoScroll = async function autoScroll(page) {
    await page.evaluate(async function () {
        await new Promise(function (resolve, reject) {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(function () {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
};
