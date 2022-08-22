const error = (err) => {
  console.log('ERROR: ', err);
  console.log('Press ENTER to close window.');
  process.stdin.on('keypress', (letter, key) => {
    if (key.enter) { process.exit(1) }
  });
}

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { 
  error: error,
  sleep: sleep
};
