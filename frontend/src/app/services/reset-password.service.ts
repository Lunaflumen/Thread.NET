import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Subject } from 'rxjs';
import { ResetPasswordComponent } from '../components/reset-password/reset-password.component';

@Injectable({ providedIn: 'root' })
export class ResetPasswordService implements OnDestroy {
    private unsubscribe$ = new Subject<void>();

    public constructor(private dialog: MatDialog) { }

    public sendLinkForReset() {
        const dialog = this.dialog.open(ResetPasswordComponent, {

            minWidth: 300,
            autoFocus: true,
            backdropClass: 'dialog-backdrop',
        });
    }

    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
