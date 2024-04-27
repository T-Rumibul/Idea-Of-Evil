import {
  ChannelType,
  Guild,
  GuildMember,
  Message,
  PermissionFlagsBits,
} from 'discord.js';

import type {IOEClient} from './IOEClient';

export interface Utils {
  isAdmin(member: GuildMember): boolean;
}
export class Utils {
  private client: IOEClient;

  constructor(client: IOEClient) {
    this.client = client;
  }

  isAdmin(member: GuildMember) {
    if (this.isOwner(member)) return true;
    if (member.permissions.has(PermissionFlagsBits.Administrator, true)) {
      return true;
    }
    const adminRoles: unknown[] = [];
    if (adminRoles.length > 0) {
      if (member.roles.cache.find(r => adminRoles.indexOf(r.id) !== -1)) {
        return true;
      }
    }
    return false;
  }

  isMod(member: GuildMember) {
    const modRoles: unknown[] = [];
    if (this.isAdmin(member)) return true;
    if (modRoles.length > 0) {
      if (member.roles.cache.find(r => modRoles.indexOf(r.id) !== -1)) {
        return true;
      }
    }
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  isOwner(member: GuildMember) {
    if (member.id === member.guild.ownerId) {
      return true;
    }
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  async getMemberFromMentions(mention: string, guild: Guild) {
    if (!mention) return null;
    const usedID = mention.replace(/([^0-9])+/g, '');
    const member = await guild.members.fetch(usedID);
    return member;
  }

  // eslint-disable-next-line class-methods-use-this
  async getChannelFromMentions(mention: string, guild: Guild) {
    const channelID = mention.replace(/([^0-9])+/g, '');
    const channel = await guild.channels.fetch(channelID);
    if (channel && channel.type !== ChannelType.GuildText) return null;
    return channel;
  }

  async deleteMessageTimeout(message: Message, timeout: number) {
    setTimeout(async () => {
      try {
        if (!message || message.channel.type !== ChannelType.GuildText) return;
        const msg = await message.channel.messages.cache.get(message.id);
        if (!msg) return;
        if (msg.deletable) {
          msg.delete();
        }
      } catch (e) {
        this.client.log('', 'Message delete error:', e);
      }
    }, timeout);
  }

  /**
   * This code shuffles the elements of an array by iterating over the array
   * backwards, and for each element in the array, selecting a random index
   * between 0 and the current index, and swapping the element at the current
   * index with the element at the randomly selected index. T he result is that
   * the array is randomly shuffled.
   */

  shuffle<T>(inputArray: T[]): T[] {
    try {
      const a = inputArray;
      if (a.length === 0) return a;
      // Iterate over the array backwards, starting at the last element
      for (let i = a.length - 1; i > 0; i -= 1) {
        // Generate a random index between 0 and the current index
        const j = Math.floor(Math.random() * (i + 1));

        // Swap the current element with a randomly selected element
        const temp = a[i]!;
        a[i] = a[j]!;
        a[j] = temp;
      }
      return a;
    } catch (e) {
      this.client.log('', 'Shuffle:', e);
      return inputArray;
    }
  }
}
