const logToFile = require('../utils/logToFile');

module.exports = (req, res, next) => {
  logToFile(`Request: ${req.method} ${req.originalUrl}`);
  next();
};
