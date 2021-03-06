import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { DialogType } from 'src/app/models/common/auth-dialog-type';
import { Subject } from 'rxjs';
import { AuthenticationService } from 'src/app/services/auth.service';
import { takeUntil } from 'rxjs/operators';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ResetPasswordService } from 'src/app/services/reset-password.service';

@Component({
    templateUrl: './auth-dialog.component.html',
    styleUrls: ['./auth-dialog.component.sass']
})
export class AuthDialogComponent implements OnInit, OnDestroy {
    public dialogType = DialogType;
    public userName: string;
    public password: string;
    public avatar: string;
    public email: string;

    public hidePass = true;
    public title: string;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private dialogRef: MatDialogRef<AuthDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private authService: AuthenticationService,
        private snackBarService: SnackBarService,
        private resetPasswordService: ResetPasswordService
    ) { }

    public ngOnInit() {
        this.avatar = 'https://cdn.shopify.com/s/files/1/0183/2727/products/LV_airbender_pin2.jpg?v=1552601810';
        this.title = this.data.dialogType === DialogType.SignIn ? 'Sign In' : 'Sign Up';
    }

    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public sendLinkForReset() {
        this.resetPasswordService.sendLinkForReset();
    }

    public close() {
        this.dialogRef.close(false);
    }

    public signIn() {
        this.authService
            .login({ email: this.email, password: this.password })
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response) => this.dialogRef.close(response), (error) => this.snackBarService.showErrorMessage(error));
    }

    public signUp() {
        this.authService
            .register({ userName: this.userName, password: this.password, email: this.email, avatar: this.avatar })
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response) => this.dialogRef.close(response), (error) => this.snackBarService.showErrorMessage(error));
    }
}
