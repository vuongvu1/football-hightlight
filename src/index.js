
const { runScraping } = require('./puppeteer');
const { writeMatchData } = require('./firebase');

runScraping().then(data => {
  // console.log(data);
  data.forEach(match => {
    const { index, title, url, time, videos } = match;
    writeMatchData(index, title, url, videos, time);
  })
});
