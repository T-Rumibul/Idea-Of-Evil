import { getModelForClass, prop } from '@typegoose/typegoose';

export class Profile {
	@prop()
	globalXP: number;
	@prop()
	guildXP: Object;
}

export const ProfileModel = getModelForClass(Profile);
