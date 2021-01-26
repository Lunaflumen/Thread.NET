import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ForgotPasswordService } from 'src/app/services/forgot-password.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-new-password',
    templateUrl: './new-password.component.html',
    styleUrls: ['./new-password.component.sass']
})
export class NewPasswordComponent implements OnInit, OnDestroy {
    public isDone = false;
    public hidePass = true;
    public imageFile: File;
    public currentUser: User;
    public resetToken: string;

    private unsubscribe$ = new Subject<void>();

    constructor(
        private forgotPasswordService: ForgotPasswordService,
        private router: Router,
        private snackBarService: SnackBarService
    ) { }

    public ngOnInit() {
        this.resetToken = localStorage.getItem('resetToken');
        this.removeToken();
    }

    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public changePassword(_password: string) {
        this.forgotPasswordService
            .resetPassword({
                password: _password,
                resetToken: this.resetToken
            })
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => (this.isDone = !this.isDone, this.removeToken()), (error) => this.snackBarService.showErrorMessage(error));
    }

    public goBack = () => this.router.navigate(['/']);

    public removeToken() {
        localStorage.removeItem('resetToken');
    }
}
