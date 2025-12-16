const fs = require('fs');
const path = require('path');
const config = require('../config/config.json');

const logToFile = (message, callback) => {
  const logLine = `[${new Date().toISOString()}] ${message}\n`;
  // callback style (Node core)
  fs.appendFile(path.resolve(config.logFile), logLine, (err) => {
    if (err) console.error('Log write error:', err);
    if (callback) callback(err);
  });
};

module.exports = logToFile;
