const express = require('express');
const path = require('path');
const walkSync = require('walk-sync');
// const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const common = require('./common');

let app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('view cache', false);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

let routes = {};
walkSync('./app/routes').forEach((filename) => {
  if (!filename.endsWith('.js')) return;
  let tmp = filename.split('/');
  let domain = `${tmp[1]}.${tmp[0]}`;
  let p = '';
  for (let i = 2; i < tmp.length; i++) {
    p += `${tmp[i].split('.')[0]}/`;
  }
  let route = require(`./routes/${filename.substr(0, filename.length - 3)}`);
  if (!(domain in routes)) routes[domain] = {};
  routes[domain][p] = route;
});

app.use((req, res, next) => {
  let host = req.hostname;
  if (!(host in routes)) host = common.config.default_domain;
  req.api_host = host;
  next();
});

app.use((req, res, next) => {
  if (!req.headers.origin) {
    return next();
  }
  common.config.cors_domains.some((domain) => {
    if (req.headers.origin.endsWith(domain)) {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type,Cache-Control,X-Requested-With');
      res.header('Access-Control-Allow-Credentials', 'true');
      return true;
    }
    return false;
  });
  return next();
});

app.use((req, res, next) => {
  let host = req.api_host;
  let tmp = req.path.split('/');
  let fp = '';
  for (let i = 1; i < tmp.length; i++) {
    fp += `${tmp[i]}/`;
    if (!(fp in routes[host])) continue;
    req.path = `/${tmp.slice(i + 1, tmp.length).join('/')}`;
    let idx = req.url.indexOf('?');
    let query = '';
    if (idx !== -1) {
      query = req.url.substr(idx);
    }
    req.url = `/${tmp.slice(i + 1, tmp.length).join('/')}${query}`;
    return routes[host][fp](req, res, next);
  }
  if (!(fp in routes[host]) && routes[host]['index/']) return routes[host]['index/'](req, res, next);
  return next();
});

app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.log(err);
  if (err.message === 'File too large') {
    return res.status(400).send({
      error: 'UPLOAD_FILE_TOO_LARGE'
    });
  }
  if (err.message === 'Too many files') {
    return res.status(400).send({
      error: 'UPLOAD_TOO_MANY_FILES'
    });
  }
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  return res.render('error');
});

process.on('unhandledRejection', (e) => { console.log(e); });

module.exports = app;
