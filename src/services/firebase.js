const firebase = require("firebase");
const { snakeCase } = require("lodash");
const moment = require("moment");

const { transformCurrentTimeToId } = require('../utils');

const {
  transformMatchToId,
  transformRemoveHighlightText
} = require("../utils");

const config = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
};
firebase.initializeApp(config);

const db = firebase.database();

const writeMatchData = async match => {
  const id = transformMatchToId(match);

  if (!match || !match.videos || match.videos.length < 1) {
    console.log("NOT A MATCH!!");
    return;
  }

  try {
    await db.ref("matches/" + id).set({
      ...match,
      title:
        match && match.title ? transformRemoveHighlightText(match.title) : "",
      league:
        match && match.league ? transformRemoveHighlightText(match.league) : ""
    });
  } catch (err) {
    console.log(err);
    console.log({ match });
  }
};

const getAllNumberOfMatch = () => {
  return db
    .ref("matches/")
    .once("value")
    .then(function(snapshot) {
      return Object.keys(snapshot.val()).length;
    });
};

const removeOldMatches = async (numberOfVideos) => {
  const keysToDelete = await db
    .ref("matches/")
    .limitToFirst(numberOfVideos)
    .once('value')
    .then(function(snapshot) {
      return Object.keys(snapshot.val());
    });
  return keysToDelete.forEach(key => {
    db
    .ref(`matches/${key}`)
    .remove();
  });
};

const getSingleMatch = match => {
  const id = transformMatchToId(match);

  return db
    .ref(`matches/${id}`)
    .once("value")
    .then(function(snapshot) {
      return snapshot.val();
    });
};

const getAllNumberOfLogs = () => {
  return db
    .ref("logs/")
    .once("value")
    .then(function(snapshot) {
      return Object.keys(snapshot.val()).length;
    });
};

const removeOldLogs = async (numberOfLogs) => {
  const keysToDelete = await db
    .ref("logs/")
    .limitToFirst(numberOfLogs)
    .once('value')
    .then(function(snapshot) {
      return Object.keys(snapshot.val());
    });
  return keysToDelete.forEach(key => {
    db
    .ref(`logs/${key}`)
    .remove();
  });
};

const writeLog = async () => {
  const time = transformCurrentTimeToId();
  try {
    await db.ref("logs/" + time).set(moment().format("LLLL Z"));
  } catch (err) {
    console.log(err);
    console.log({ match });
  }
};

const writeError = async () => {
  const time = transformCurrentTimeToId();
  try {
    await db.ref("errors/" + time).set({
      runningTime: moment().format("LLLL Z")
    });
  } catch (err) {
    console.log(err);
    console.log({ match });
  }
};

module.exports = {
  writeMatchData,
  getSingleMatch,
  writeLog,
  writeError,
  getAllNumberOfMatch,
  removeOldMatches,
  getAllNumberOfLogs,
  removeOldLogs,
};
