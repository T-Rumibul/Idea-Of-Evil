import Base from '@bot/core/Base';
import type {IOEClient} from '@bot/core/IOEClient';

import {Guild, GuildModel} from '../models/Guild';

export default class GuildController extends Base {

  constructor(client: IOEClient) {
    super('GuildController', client);
  }

  overrideInit() {
  }

  public async get(id: string) {
    this.log(`Get value from db for guildID: ${id}`);
    let document: Guild | null;
    document = await GuildModel.findOne({guildID: id}).exec();
    if (document === null) {
      document = await GuildModel.create({
        guildID: id,
      });
    }

    return document;
  }

  public async set(id: string, document: Guild) {
    this.log(`Set new value to cache for guildID:${id}.`);
    
   
  }
  public async setMusicChannel(
    guildId: string,
    channelId: string
  ): Promise<void> {
    try {
      const guildData = await this.get(guildId);
      guildData.musicChannel = channelId;
      GuildModel.updateOne({guildID: guildId}, guildData)
    } catch (e) {
      this.log('', e);
    }
  }
  public async deleteMusicChannel(guildId: string): Promise<void> {
    try {
      await GuildModel.updateOne(
        {guildID: guildId},
        {$unset: {musicChannel: ''}}
      ).exec();
      this.log('Removed music channel field', guildId);
    } catch (e) {
      this.log('', e);
    }
  }
  public async getMusicChannels(): Promise<Map<string, string>> {
    try {
      const {guilds} = this.client;
      // Map key: guildID, value: channelID
      const musicChannels = new Map();

      for (const [key, value] of guilds.cache) {
        const guildData = await this.get(key);
        const musicChannelId = guildData.musicChannel;
        if (!musicChannelId) {
          musicChannels.set(key, '');
        } else {
          musicChannels.set(key, musicChannelId);
        }
      }

      return musicChannels;
    } catch (e) {
      this.log('', e);
      return new Map();
    }
  }

  public async setWelcomeChannel(guildId: string, channelId: string) {
    try {
      const guildData = await this.get(guildId);
      guildData.welcomeChannel = channelId;
      GuildModel.updateOne({guildID: guildId}, guildData)
      
    } catch (e) {
      this.log('', e);
    }
  }

  public async getWelcomeChannel(guildId: string): Promise<string> {
    try {
      const guildData = await this.get(guildId);
      return guildData.welcomeChannel || '';
    } catch (e) {
      this.log('', e);
      return '';
    }
  }
}
