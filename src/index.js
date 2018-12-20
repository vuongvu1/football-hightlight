const { resetAll, regularRun } = require('./helper');

const main = async () => {
  console.time('regularRun');

  await regularRun();

  console.timeEnd('regularRun');
  process.exit();
};

main();

// [1, 2, 3].forEach(num => console.log(num));
