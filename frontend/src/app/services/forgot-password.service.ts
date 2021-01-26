import { Injectable } from '@angular/core';
import { ResetPassword } from '../models/resetPassword/reset-password';
import { HttpInternalService } from './http-internal.service';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { ResetPasswordUser } from '../models/resetPassword/reset-password-user';
import { map } from 'rxjs/operators';
import { ResetPasswordDto } from '../models/resetPassword/reset-password-dto';
import { AccessTokenDto } from '../models/token/access-token-dto';

@Injectable({ providedIn: 'root' })
export class ForgotPasswordService {
    public routePrefix = '/api/resetPassword';

    public constructor(private httpService: HttpInternalService) { }

    public forgotPassword(user: ResetPassword) {
        return this._handleResetPasswordResponse(this.httpService.postFullRequest<ResetPasswordUser>(`${this.routePrefix}/forgotPassword`, user));
    }

    public resetPassword(password: ResetPasswordDto) {
        return this.httpService.postRequest(`${this.routePrefix}/resetPassword`, password)
    }

    public areResetTokenExist() {
        return localStorage.getItem('resetToken');
    }

    private _handleResetPasswordResponse(observable: Observable<HttpResponse<ResetPasswordUser>>) {
        return observable.pipe(
            map((resp) => {
                this._setTokens(resp.body.token);
                return resp.body.user;
            })
        );
    }

    private _setTokens(tokens: AccessTokenDto) {
        if (tokens && tokens.refreshToken) {
            localStorage.setItem('resetToken', JSON.stringify(tokens.refreshToken));
        }
    }
}