const { resetAll, regularRun } = require('./helper');

const main = async () => {
  console.time('regularRun');

  await resetAll();
  // await regularRun();

  console.timeEnd('regularRun');
  process.exit();
};

try {
  main();
} catch (err) {
  console.log("GETTING ERROR!!! ", err);
  process.exit();
}


// [1, 2, 3].forEach(num => console.log(num));
