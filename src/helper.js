const moment = require("moment");

const {
  runScrapingAllMatches,
  scrapeAllAvailableMatches,
  scrapeSingleMatch,
  getNumberOfAvailableVideo
} = require("./services/puppeteer");
const {
  writeMatchData,
  getSingleMatch,
  getAllNumberOfMatch,
  removeOldMatches,
  getAllNumberOfLogs,
  removeOldLogs,
} = require("./services/firebase");

const checkRemoveOldMatches = async () => {
  const all = await getAllNumberOfMatch();
  if (all > 40) {
    const left = all - 40;
    removeOldMatches(left)
  }
};

const checkRemoveOldLogs = async () => {
  const all = await getAllNumberOfLogs();
  if (all > 72) {
    const left = all - 72;
    removeOldLogs(left)
  }
};

const resetAll = async () => {
  try {
    const allMatches = await runScrapingAllMatches();
    for (let i = 0; i < allMatches.length; i = i + 1) {
      await writeMatchData(allMatches[i]);
    }
    await checkRemoveOldMatches();
    await checkRemoveOldLogs();
  } catch (err) {
    console.error("rerunScrappingAllMatches");
    console.log(err);
  }
};

const createOrUpdateSingleMatch = async match => {
  const newMatch = await scrapeSingleMatch(match);
  await writeMatchData(newMatch);
};

const regularRun = async () => {
  console.group();
  console.log(`Regular run on: ${moment().format("LLLL Z")}`);

  let hasNewMatch = false;
  const newMatches = await scrapeAllAvailableMatches();

  for (let i = 0; i < 10; i = i + 1) {
    console.group();
    console.log("__________________");
    console.log(`Checking videos for: ${newMatches[i].title}`);

    const savedMatch = await getSingleMatch(newMatches[i]);
    if (!savedMatch) {
      console.log(`=====> Create videos for: ${newMatches[i].title}`);
      await createOrUpdateSingleMatch(newMatches[i]);
    } else {
      const newMatchAvailableVideos = await getNumberOfAvailableVideo(
        newMatches[i]
      );
      const oldMatchVideos = savedMatch.videos ? savedMatch.videos.length : 0;
      if (newMatchAvailableVideos > oldMatchVideos) {
        console.log(`=====> Update videos for: ${savedMatch.title}`);
        await createOrUpdateSingleMatch(newMatches[i]);
      } else {
        console.log("=====> No need to update!");
      }
    }

    console.groupEnd();
  }

  console.groupEnd();
};

module.exports = {
  regularRun,
  resetAll,
  checkRemoveOldMatches,
  checkRemoveOldLogs,
};
