
const schedule = require('node-schedule');
const _ = require("lodash");
const moment = require("moment");

const {
  runScrapingAllMatches,
  runScrapingAllMatchesWithoutDetails
} = require('./services/puppeteer');
const { writeMatchData, getAllMatches, getSingleMatch } = require('./services/firebase');


const resetAll = async () => {
  try {
    const allMatches = await runScrapingAllMatches();
    allMatches.forEach(match => {
      writeMatchData(match);
    });
  } catch (err) {
    console.error('rerunScrappingAllMatches');
    console.log(err);
  }
};


const regularRun = async () => {
  const newMatches = await runScrapingAllMatchesWithoutDetails();
  console.log(newMatches);

  // const currentMatches = await getAllMatches();
  // Object.keys(currentMatches).forEach(key=> {
  //   console.log(currentMatches[key].title);
    
  // });
  // const singleMatch = await getSingleMatch(Object.keys(currentMatches)[0]);

  // console.log({ singleMatch: singleMatch.videos });
};

module.exports = {
  regularRun,
  resetAll
};