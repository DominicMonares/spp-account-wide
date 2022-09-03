const { exec } = require('child_process');

exec('start cmd.exe /K "node src/index.js & exit"');

// REMOVE IMPORT AND INVOCATION FOR PRODUCTION
const { accountwideAchievements } = require('./src/index.js');
accountwideAchievements();
