const Promise = require('bluebird');
const config = require('config');
const redis = require('redis');

const redisClient = redis.createClient(config.redis);
const promisedRedisClient = Promise.promisifyAll(redisClient);
const redisLock = require('redis-lock')(redisClient);

const promisedRedisLock = async (key) => {
  return new Promise(async (resolve) => {
    redisLock(key, (done) => {
      resolve({
        release: done
      });
    });
  });
};

const redisAtomicManipulateString = async (key, manipulate) => {
  let lock = await promisedRedisLock(`l:${key}`);
  let val = await promisedRedisClient.getAsync(key);
  let newVal;
  try {
    if (manipulate) {
      newVal = await manipulate(val);
    }
  } catch (e) {
    await lock.release();
    throw e;
  }
  if (newVal && newVal.constructor === Array) {
    await lock.release();
    return newVal;
  }
  if (newVal) {
    await promisedRedisClient.setAsync(key, newVal);
    await lock.release();
    return newVal;
  }
  await lock.release();
  return val;
};

module.exports = {
  redis: promisedRedisClient,
  redisLock,
  redisAtomicManipulateString
};
