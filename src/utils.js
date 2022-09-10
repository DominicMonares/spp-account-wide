const readline = require('readline');

const closeWindow = (count) => {
  setInterval(() => {
    // console.log(`This window will close in ${count} seconds...`);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`This window will close in ${count - 1} seconds...`);
    count--;

    if (count <= 0) process.exit(0);
  }, 1000);
}

const error = (err) => {
  console.log('ERROR: ', err)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(
    () => rl.question(
      'Press ENTER to close window.', 
      () => process.exit(1)
    )
  );
}

module.exports = { 
  closeWindow: closeWindow,
  error: error
};
