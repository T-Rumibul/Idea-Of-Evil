import type { TextChannel } from "discord.js";
import { sleep } from "../Core";

export const deleteAllMessages = async (channel: TextChannel) => {
    try {
        await channel.bulkDelete(
          (
            await channel.messages.fetch({
              cache: true,
            })
          ).size
        );
      } catch (err) {
       // Try to delete messages one by one if bulkDelete fails
        const messagesCollection = await channel.messages.fetch({
          cache: true
        })
        const messages = messagesCollection.values()
        for(let msg of messages) {
          if(msg.deletable) await msg.delete()
          else {
            await channel.send(
              '⚠ **Message deletion failed**'
            );
            return;
        }
        await sleep(1);
        }
      }
}