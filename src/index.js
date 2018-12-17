
const { runScraping } = require('./puppeteer');
const { writeMatchData, getAllMatches, getSingleMatch } = require('./firebase');
// const _ = require("lodash");
// const moment = require("moment");

// runScraping().then(data => {
//   // console.log(data);
//   data.forEach(match => {
//     writeMatchData(match);
//   })
// });

// const index = _.snakeCase(`${'FC Nurnberg vs Wolfsburg Highlights'}_${moment('2018-12-14T21:45:34+00:00').format("DD-MM-YYYY")}`);
// console.log(index);

const main = async () => {
  const currentMatches = await getAllMatches();
  // console.log({ currentMatches });

  const singleMatch = await getSingleMatch(Object.keys(currentMatches)[0]);

  console.log({ singleMatch: singleMatch.videos });
}


main();
