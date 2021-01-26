import { User } from 'src/app/models/user';
import { AccessTokenDto } from '../token/access-token-dto';

export interface ResetPasswordUser {
    user: User;
    token: AccessTokenDto;
}
