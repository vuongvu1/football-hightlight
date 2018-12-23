const schedule = require("node-schedule");
const { resetAll, regularRun } = require("./helper");
const { writeLog, writeError } = require("./services/firebase");

const main = async () => {
  console.time("regularRun");

  // await resetAll();
  await regularRun();

  console.timeEnd("regularRun");
};

let time = 0;

schedule.scheduleJob({ minute: [0, 10, 20, 30, 40, 50] }, function() {
  try {
    main();
    writeLog(time++);
  } catch (err) {
    writeError(time);
    console.log("GETTING ERROR!!! ", err);
  }
});
