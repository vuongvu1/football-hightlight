
const schedule = require('node-schedule');
const { isMatch } = require('lodash');
const moment = require('moment');

const {
  runScrapingAllMatches,
  scrapeAllAvailableMatches,
  scrapeSingleMatch,
  getNumberOfAvailableVideo,
} = require('./services/puppeteer');
const {
  writeMatchData,
  getLatestMatches,
  getSingleMatch
} = require('./services/firebase');


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

const createOrUpdateSingleMatch = async (match) => {
  const newMatch = await scrapeSingleMatch(match);
  writeMatchData(newMatch);
};

const regularRun = async () => {
  let hasNewMatch = false;
  const newMatches = await scrapeAllAvailableMatches();

  for (let i = 0; i < newMatches.length; i = i + 1) {
    const savedMatch = await getSingleMatch(newMatches[i]);
    if (!savedMatch) {
      await createOrUpdateSingleMatch(newMatches[i]);
    } else {
      const newMatchAvailableVideos = await getNumberOfAvailableVideo(newMatches[i]);
      if (newMatchAvailableVideos > savedMatch.videos.length) {
        console.log(`Update videos for: ${savedMatch.title}`);
        await createOrUpdateSingleMatch(newMatches[i]);
        console.log({ savedMatch });
      } else {
        console.log('No need to update!');
      }
    }
  }

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
