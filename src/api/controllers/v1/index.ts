import {Request, Response} from 'express';
import client from '@bot/index';
import getLogger from '@api/helpers';
import dotenv from 'dotenv';

dotenv.config();

const logger = getLogger('API:Controllers');
export async function info(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const intervalID = setInterval(() => {
    const {user} = client;
    const response = {
      uptime: client.uptime,
      avatarUrl: user ? user.avatarURL() : '',
      username: user ? user.username : '',
    };
    res.write(`data: ${JSON.stringify(response)}\n\n`);
  }, 1000);

  // If client closes connection, stop sending events
  res.on('close', () => {
    logger.log('Controller', 'Client closed conection');
    clearInterval(intervalID);
    res.end();
  });
}
export async function setUsername(req: Request, res: Response) {
  const {username} = req.body;
  if (client.user) client.user.setUsername(username);
}

export async function sendMessage(req: Request, res: Response) {
  const {message, token} = req.body;
  if (token !== process.env.PORTFOLIO_TOKEN) return;
  const guild = await client.guilds.fetch(process.env.GUILD_ID || '');
  const member = await guild.members.fetch(process.env.MEMBER_ID || '');
  await member.send(message);
  res.status(200);
}

export async function spizditInfu(req: Request, res: Response) {
  logger.log(req.body);
}
export default {
  info,
  setUsername,
  sendMessage,
  spizditInfu,
};
