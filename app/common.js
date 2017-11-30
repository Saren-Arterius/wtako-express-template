const config = require('config');
const fs = require('fs');
const path = require('path');

const utils = {
  sendError: (res, error) => {
    if (error.constructor === Array) {
      return res.status(error[0]).send({
        error: error[1],
        info: error[2]
      });
    }
    return res.status(500).send({
      error: 'SERVER_ERROR',
      info: error
    });
  }
};

let base = path.join(__dirname, 'utils');
fs.readdirSync(base).filter(name => name.indexOf('.js') !== -1).forEach((file) => {
  Object.assign(utils, require(path.join(base, file.replace('.js', ''))));
});

let exps = {
  utils,
  config
};

let connBase = path.join(base, 'conn');
fs.readdirSync(connBase).filter(name => name.indexOf('.js') !== -1).forEach((file) => {
  Object.assign(exps, require(path.join(connBase, file.replace('.js', ''))));
});

module.exports = exps;
