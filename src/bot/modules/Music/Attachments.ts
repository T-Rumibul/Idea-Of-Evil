import type IOEClient from '@bot/core/IOEClient';
import type {Music} from '../Music';
import type { Message } from 'discord.js';

export class MusicAttachments {
    constructor(
      private music: Music,
      private client: IOEClient
    ) {}
    
    public getSong(message: Message) {
        const attachment = message.attachments.first();
        if(!attachment || !attachment.proxyURL) return false;
        const song = {
            title: attachment?.name,
            link: attachment?.proxyURL,
            repeat: false,
            duration: '',
            thumbnail: '',
            attachment: true
          };
          return song;
    }
}