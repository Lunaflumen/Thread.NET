import { Component, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { MatDialogRef } from '@angular/material';
import { takeUntil } from 'rxjs/operators';
import { ForgotPasswordService } from 'src/app/services/forgot-password.service';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.sass']
})
export class ResetPasswordComponent implements OnDestroy {

    public isDone = false;
    public loading = false;

    private unsubscribe$ = new Subject<void>();

    constructor(
        private dialogRef: MatDialogRef<ResetPasswordComponent>,
        private forgotPasswordService: ForgotPasswordService,
    ) { }

    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public sendResetMessage(_email: string) {
        this.loading = true;

        this.forgotPasswordService
            .forgotPassword({
                email: _email,
                href: window.location.href
            })
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => this.loading = false);
    }

    public done() {
        this.isDone = !this.isDone;
    }

    public close() {
        this.dialogRef.close(false);
    }
}
