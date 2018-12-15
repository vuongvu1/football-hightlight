
const { runScraping } = require('./puppeteer');
const { writeMatchData } = require('./firebase');
// const _ = require("lodash");
// const moment = require("moment");

runScraping().then(data => {
  // console.log(data);
  data.forEach(match => {
    writeMatchData(match);
  })
});

// const index = _.snakeCase(`${'FC Nurnberg vs Wolfsburg Highlights'}_${moment('2018-12-14T21:45:34+00:00').format("DD-MM-YYYY")}`);
// console.log(index);
