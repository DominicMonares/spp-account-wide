const readline = require('readline');

const error = () => {
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

module.exports = { error: error };
