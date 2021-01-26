import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ForgotPasswordService } from '../services/forgot-password.service';

@Injectable({ providedIn: 'root' })
export class ResetPasswordGuard implements CanActivateChild, CanActivate {
    constructor(private router: Router, private forgotPasswordService: ForgotPasswordService) { }

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.checkForActivation(state);
    }

    public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.checkForActivation(state);
    }

    private checkForActivation(state: RouterStateSnapshot) {
        if (this.forgotPasswordService.areResetTokenExist()) {
            return true;
        }

        this.router.navigate(['/']);

        return false;
    }
}
