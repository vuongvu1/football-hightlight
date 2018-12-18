const firebase = require("firebase");
const _ = require("lodash");
const moment = require("moment");

// Initialize Firebase
// TODO: Replace with your project's customized code snippet
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
  const {
    title = '',
    url = '',
    time = '',
    videos = []
  } = match;
  
  const id = _.snakeCase(`${moment(time).valueOf()}_${moment(time).format("DD/MM/YYYY")}_${title}`);

  try {
    db.ref('matches/' + id).set({ title, url, videos, time });
  } catch (err) {
    console.log(err);
    console.log({ title, url, videos, time });
  }
}

const getAllMatches = () => {
  return db.ref('/matches/').once('value').then(function(snapshot) {
    return snapshot.val();
  });
};

const getSingleMatch = (id) => {
  return db.ref(`/matches/${id}`).once('value').then(function(snapshot) {
    return snapshot.val();
  });
};

module.exports = {
  writeMatchData,
  getAllMatches,
  getSingleMatch
};
