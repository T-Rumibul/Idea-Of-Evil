import Base from '@bot/core/Base';
import type {IOEClient} from '@bot/core/IOEClient';
import {Profile, ProfileModel} from '../models/Profile';

export default class ProfileController extends Base {
  constructor(client: IOEClient) {
    super('GuildController', client);
  }
  public async get(id: string) {
    this.log(`Get value from db for ProfileID: ${id}`);
    let document: Profile | null;
    document = await ProfileModel.findOne({userID: id}).exec();

    if (document === null) {
      document = await ProfileModel.create({
        userID: id,
      });
    }
    return document;
  }
  public async blackListUser(id: string, reason: string): Promise<void> {
    const profileData = await this.get(id);
    profileData.ban = true;
    profileData.banReason = reason;
    ProfileModel.updateOne({userID: id}, profileData)
   
  }
}
