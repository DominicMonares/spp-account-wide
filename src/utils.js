const readline = require('readline');

// General

const endProcess = (err) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(
    () => rl.question(
      err ? 'Press ENTER to close window.' : '', 
      () => process.exit(1)
    )
  );
}

const closeWindow = async () => {
  let count = 10;
  setInterval(() => {
    if (count === 10) {
      process.stdout.write('Press ENTER to close window.\n');
      process.stdout.write(`This window will close in ${count - 1} seconds...`);
    } else {
      process.stdout.moveCursor(0, -1);
      process.stdout.clearScreenDown();
      process.stdout.cursorTo(0);
      process.stdout.write('Press ENTER to close window.\n');
      process.stdout.write(`This window will close in ${count - 1} seconds...`);
    }
    count--;
    if (count <= 0) process.exit(0);
  }, 1000);

  await endProcess();
}

const error = async (err) => {
  console.log('ERROR: ', err);
  await endProcess(err);
}


// Queries

const quoteJoin = (queryVals) => '"' + queryVals.join('", "') + '"';
const parenJoin = (queryVals) => '(' + queryVals.map(qv => qv.join(', ')).join('), (') + ')';


// Transfers

const getFaction = (race) => {
  return (race === 1 || race === 3 || race === 4 || race === 7 || race === 11) ? 'A' : 'H'
}

module.exports = { 
  closeWindow: closeWindow,
  error: error,
  quoteJoin: quoteJoin,
  parenJoin: parenJoin,
  getFaction: getFaction
};
