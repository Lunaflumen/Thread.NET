import { User } from '../user';

export interface NegativeReaction {
    isDislike: boolean;
    user: User;
}
