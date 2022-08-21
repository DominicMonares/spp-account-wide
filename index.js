const { exec } = require('child_process');

exec('start cmd.exe /K "node src/index.js & exit"');
