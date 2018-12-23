const firebase = require("firebase");
const _ = require("lodash");
const moment = require("moment");

const { transformMatchToId, transformRemoveHighlightText } = require('../utils');

const config = {
  apiKey: "AIzaSyCD87Y1Q0XYGAgCeo4GvhMj8vBdr_EQkEs",
  authDomain: "collector-91b7c.firebaseapp.com",
  databaseURL: "https://collector-91b7c.firebaseio.com",
  projectId: "collector-91b7c",
  storageBucket: "collector-91b7c.appspot.com",
  messagingSenderId: "289258932231"
};
firebase.initializeApp(config);

const db = firebase.database();

const writeMatchData = (match) => {
  const id = transformMatchToId(match);

  try {
    db.ref('matches/' + id).set({
      ...match,
      title: match && match.title ? transformRemoveHighlightText(match.title) : '',
      league: match && match.league ? transformRemoveHighlightText(match.league) : '',
    });
  } catch (err) {
    console.log(err);
    console.log({ match });
  }
}

const getLatestMatches = (numberOfVideos) => {
  return db.ref('/matches/').limitToLast(numberOfVideos).once('value').then(function(snapshot) {
    return snapshot.val();
  });
};

const getSingleMatch = (match) => {
  const id = transformMatchToId(match);

  return db.ref(`/matches/${id}`).once('value').then(function(snapshot) {
    return snapshot.val();
  });
};

module.exports = {
  writeMatchData,
  getLatestMatches,
  getSingleMatch
};
