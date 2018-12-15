const firebase = require ("firebase");

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

const writeMatchData = (index, title = '', url = '', videos = [], time = '') => {
  try {
    db.ref('matches/' + index).set({ index, title, url, videos, time });
  } catch {
    console.log({ index, title, url, videos, time });
  }
}

module.exports = {
  writeMatchData
};
