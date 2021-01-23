import { BaseModule } from "@bot/core/BaseModule";
const NAME = 'Follower';
export class Follower extends BaseModule {
    constructor() {
        super(NAME)
    }
}

let instance: Follower;
export function follower() {
    if (!instance) instance = new Follower();

    return instance;
}

export default follower;