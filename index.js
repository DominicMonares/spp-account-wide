// ONLY USED FOR PRODUCTION
const { exec } = require('child_process');
exec('start cmd.exe /K "node src/index.js & exit"');

// ONLY USED FOR DEVELOPMENT
// const { accountwideTransfer } = require('./src/index.js');
// accountwideTransfer();
