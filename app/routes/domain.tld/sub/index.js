const express = require('express');
const common = require('../../../common');

const router = express.Router();

router.get('/', async (req, res, next) => {
  let info = await common.redis.infoAsync();
  res.send(info.replace(/\n/g, '<br/>'));
});

module.exports = router;
