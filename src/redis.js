import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_ENDPOINT
});

redisClient
  .on('connect', () => {
    console.log('Redis Client Connected: ' + process.env.REDIS_ENDPOINT)
  })
  .on('error', (err) => console.error('Redis Client Error', err));


export default redisClient;