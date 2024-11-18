import {IOEClient} from '@bot/core/IOEClient';
import {ChannelType, Message} from 'discord.js';

export async function Emit(message: Message, client: IOEClient) {
  try {
    if (message.author.bot) return;
    if (
      (await client.IOE.DB.checkBlackListUser(message.author.id)) !==
      null
    ) {
      if (message.channel.type !== ChannelType.GuildText) return;
      const msg = await message.channel.send(
        `<@${
          message.author.id
        }> Вы внесены в черный список и не можете использовать команды этого бота. \n Причина: ${await client.IOE.DB.checkBlackListUser(
          message.author.id
        )}`
      );
      client.IOE.utils.deleteMessageTimeout(msg, 10000);
      message.delete();
      return;
    }
    await client.modules.music.play(message);
  } catch (e) {
    client.log('', 'Message event error', e);
  }
}

export default Emit;
