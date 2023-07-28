import {getModelForClass, prop} from '@typegoose/typegoose';

export class Guild {
  @prop({required: true})
  public guildID!: string;

  @prop({default: '&'})
  public prefix?: string;

  @prop({default: ''})
  public welcomeChannel?: string;

  @prop({default: ''})
  public musicChannel?: string;
}

export const GuildModel = getModelForClass(Guild);
