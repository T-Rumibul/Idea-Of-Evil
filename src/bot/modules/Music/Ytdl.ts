import * as ytdl from 'play-dl';
import dotenv from 'dotenv';

dotenv.config();
ytdl.setToken({
  spotify: {
    client_id: process.env.SPOTIFY_CLIENT_ID || '',
    client_secret: process.env.SPOTIFY_CLIENT_SECRET || '',
    refresh_token: process.env.SPOTIFY_REFRESH_TOKEN || '',
    market: 'US',
  },
  youtube: {
    cookie: process.env.YOUTUBE_COOKIES || '',
  },
});

export default ytdl;
