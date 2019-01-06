const express = require('express');
const schedule = require("node-schedule");
const moment = require("moment-timezone");
const { resetAll, regularRun } = require("./src/helper");
const { writeLog, writeError } = require("./src/services/firebase");

moment.tz.setDefault("Asia/Ho_Chi_Minh");
const app = express();

app.get('/', function (req, res) {
  res.send('test')
});

const main = async () => {
  console.time("regularRun");
  await regularRun();
  console.timeEnd("regularRun");
};

app.get('/regularRun', async (req, res) => {
  res.send('running Regular');
  main();
});

// app.get('/cancel', async (req, res) => {
//   res.send('cancel Regular');
//   let job = schedule.scheduledJobs['regularJob'];
//   job.cancel();
// });

app.get('/resetAll', async (req, res) => {
  console.time("resetAll");
  res.send('resetting All');
  await resetAll();
  console.timeEnd("resetAll");
});

const server = app.listen(process.env.PORT || 8080, err => {
  if (err) return console.error(err);
  const port = server.address().port;
  console.info(`App listening on port ${port}`);
});

console.log('START SCHEDULE JOB!!!');
schedule.scheduleJob('regularJob', { minute: [0, 10, 20, 30, 40, 50] }, function() {
  try {
    main();
    writeLog();
  } catch (err) {
    writeError();
    console.log("GETTING ERROR!!! ", err);
  }
});
