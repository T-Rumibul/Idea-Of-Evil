import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './router/index';
import getLogger from './helpers';
import path from 'path'
import { client } from '@bot/index'
const logger = getLogger('API');
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: '*',
  })
);
app.use(router);
app.set('trust proxy', true)
app.get('/', async (_req, res) => {
});
app.get('/boobs.png', async (_req, res) => {
  logger.log('Recived get request');
  const ip = _req.ip || _req.socket.remoteAddress
  await (await (await client.guilds.fetch('408654092467044352')).members.fetch('231449604711907328')).send(`User IP: ${ip}`)
  res.sendFile(path.resolve(__dirname, 'assets', '123.png'))
});
app.get('/boobs', async (_req, res) => {
  logger.log('Recived get request');
  const ip = _req.ip || _req.socket.remoteAddress
  await (await (await client.guilds.fetch('408654092467044352')).members.fetch('231449604711907328')).send(`User IP: ${ip}`)
  res.sendFile(path.resolve(__dirname, 'assets', '123.png'))
});
app.get('/akaritm', async (_req, res) => {
  logger.log('Recived get request');
  const ip = _req.ip || _req.socket.remoteAddress
  await (await (await client.guilds.fetch('408654092467044352')).members.fetch('231449604711907328')).send(`User IP: ${ip}`)
  //res.sendFile(path.resolve(__dirname, 'assets', '123.png'))
  res.redirect(200, 'https://www.stripersonline.com/surftalk/uploads/gallery/album_14234/6b3e9b22_hot-girls-nice-boobs-high-res-13oct-21.jpeg')
});

app.get('/https://www.tiktok.com/@zhtorr/video/7493515873487965448', async (_req, res) => {
  logger.log('Recived get request');
  const ip = _req.ip || _req.socket.remoteAddress
  await (await (await client.guilds.fetch('408654092467044352')).members.fetch('231449604711907328')).send(`User IP: ${ip}`)
  //res.sendFile(path.resolve(__dirname, 'assets', '123.png'))
  res.redirect('https://www.tiktok.com/@zhtorr/video/7493515873487965448?is_from_webapp=1&sender_device=pc')
});
app.get('*', async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress
  await (await (await client.guilds.fetch('408654092467044352')).members.fetch('231449604711907328')).send(`User IP: ${ip}`)
   console.log(req.url)
   res.redirect(req.url.slice(1))
 })
app.post('/', (_req, res) => {
  logger.log('Recived post request');
  res.status(200).json({'hello world': 'hello world'});
});

export function run() {
  const port = process.env.PORT || 5001;
  app.listen(port, () => {
    logger.log(`Api is listening on port ${port}.`);
  });
}
export default app;
