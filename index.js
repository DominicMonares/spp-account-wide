const { exec } = require('child_process');

exec('start cmd.exe /K "node src/index.js & exit"');

// REMOVE IMPORT AND INVOCATION FOR PRODUCTION
const { transfer_achievements } = require('./src/index.js');
transfer_achievements();
