import http from 'http';
import { config } from 'dotenv';
import { WEATHER_API } from './config.mjs';
import redisClient from './redis.js';

config();

await redisClient.connect();

const fetchWeatherFromCity = (req, res) => async (city) => {
  const { WEATHER_API_KEY } = process.env;
  try {
    let data = await redisClient.get(city)
    if (data) {
      console.log('data from redis')
      res.end(data);
      return;
    }
    
    console.log('data from api')
    const response = await fetch(`${WEATHER_API}/${city}?unitGroup=metric&key=${WEATHER_API_KEY}&contentType=json`)
    data = await response.json()
    await redisClient.set(city, JSON.stringify(data), process.env.REDIS_EXPIRATION);
    res.end(JSON.stringify(data));
  } catch (e) {
    console.error(e)
    console.error('Error fetching data');
    res.end('Error fetching data');
  }
}

const handleGETRequest = (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const params = url.searchParams;
  const city = params.get('city');

  fetchWeatherFromCity(req, res)(city);
}

const server = http.createServer((req, res) => {
  switch (req.method) {
    case 'GET':
      handleGETRequest(req, res);
      break;
    case 'POST':
      res.end('POST');
      break;
    case 'PUT':
      res.end('PUT');
      break;
    case 'DELETE':
      res.end('DELETE');
      break;
    default:
      res.end('Hello World');
  }
})


export default server;