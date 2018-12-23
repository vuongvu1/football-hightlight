const schedule = require("node-schedule");
const { resetAll, regularRun } = require("./helper");
const { writeLog } = require("./services/firebase");

const main = async () => {
  console.time("regularRun");

  // await resetAll();
  await regularRun();

  console.timeEnd("regularRun");
  process.exit();
};

let time = 0;

schedule.scheduleJob({ minute: [0, 10, 20, 30, 40, 50] }, function() {
  try {
    main();
    writeLog(time++);
  } catch (err) {
    console.log("GETTING ERROR!!! ", err);
    process.exit();
  }
});

// [1, 2, 3].forEach(num => console.log(num));
