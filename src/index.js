/*
  call credit transfer
  call progress transfer
  settimeout for 10 sec:
    success message
    end process 0

  all errors will:
    end function(s)
    settimeout for 10 minutes:
      detailed error message
      end process 1? (double check best practice exit code)
*/

const { transfer_credit } = require('./credit/transfer');
const { transfer_progress } = require('./progress/transfer');

const transfer_achievements = async () => {
  await transfer_credit();
  await transfer_progress();

  console.log(
    'Successfully transferred achievement credit and progress between all of your characters!'
  );

  let count = 11;
  setInterval(() => {
    // console.log(`This window will close in ${count} seconds...`);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`This window will close in ${count - 1} seconds...`);
    count--;

    if (count <= 0) process.exit(0);
  }, 1000);
}

transfer_achievements();
