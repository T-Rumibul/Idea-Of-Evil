import { getModelForClass, prop } from '@typegoose/typegoose';

export class Profile {
	@prop()
	userID: string;

	@prop({ default: 0 })
	globalXP?: number;

	@prop({ default: 0 })
	guildXP?: number;

	@prop({ default: false })
	ban?: boolean;

	@prop({ default: '' })
	banReason?: string;
}

export const ProfileModel = getModelForClass(Profile);
