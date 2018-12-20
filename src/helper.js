
const schedule = require('node-schedule');
const _ = require('lodash');
const moment = require('moment');

const {
  runScrapingAllMatches,
  getAllAvailableMatches
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
  let hasNewMatch = false;

  const newMatches = await getAllAvailableMatches();
  const oldMatches = Object.values(await getAllMatches())
    .map(old => ({ title: old.title, numOfVideos: old.videos.length }));

  console.log(newMatches);

  // newMatches.forEach((new) => {
  //   if (oldMatches.includes(new.title)) {
  //     console.log(new.title);
  //   }
  // });

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
