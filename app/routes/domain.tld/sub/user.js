const express = require('express');
// const common = require('../../../common');

const router = express.Router();

router.get('/', async (req, res, next) => {
  res.send('User list');
});

router.get('/:user_id', async (req, res, next) => {
  res.send(`User ID: ${req.params.user_id}`);
});

module.exports = router;
