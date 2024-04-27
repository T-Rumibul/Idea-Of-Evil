import IOEClient from '@bot/core/IOEClient';
import {Interaction} from 'discord.js';

export function Emit(interaction: Interaction, client: IOEClient) {
  client.modules.music.interaction(interaction);
}

export default Emit;
