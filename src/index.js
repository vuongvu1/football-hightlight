
const schedule = require('node-schedule');
const _ = require("lodash");
const moment = require("moment");

const { runScraping } = require('./services/puppeteer');
const { writeMatchData, getAllMatches, getSingleMatch } = require('./services/firebase');


// runScraping().then(data => {
//   // console.log(data);
//   data.forEach(match => {
//     writeMatchData(match);
//   })
// });


const main = async () => {
  const currentMatches = await getAllMatches();
  // console.log({ currentMatches });

  const singleMatch = await getSingleMatch(Object.keys(currentMatches)[0]);

  console.log({ singleMatch: singleMatch.videos });
}


main();
