import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Subject } from 'rxjs';
import { User } from '../models/user';
import { Post } from '../models/post/post';
import { ShareComponent } from '../components/share/share.component';

@Injectable({ providedIn: 'root' })
export class ShareService implements OnDestroy {
    private unsubscribe$ = new Subject<void>();

    public constructor(private dialog: MatDialog) { }

    public share(currentUser: User, post: Post) {
        const dialog = this.dialog.open(ShareComponent, {

            minWidth: 300,
            autoFocus: true,
            backdropClass: 'dialog-backdrop',
            data: {
                _currentUser: currentUser,
                _post: post
            }
        });
    }

    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
