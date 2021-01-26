import { Component, Inject, OnDestroy, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subject } from 'rxjs';
import { Post } from 'src/app/models/post/post';
import { User } from 'src/app/models/user';
import { PostService } from 'src/app/services/post.service';

@Component({
    templateUrl: './share.component.html',
    styleUrls: ['./share.component.sass']
})
export class ShareComponent implements OnDestroy {
    public currentUser: User;
    public post: Post;

    private unsubscribe$ = new Subject<void>();

    constructor(
        private postService: PostService,
        private dialogRef: MatDialogRef<ShareComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        this.currentUser = this.data._currentUser;
        this.post = this.data._post;
    }

    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public share(_email: string) {
        this.postService
            .SendMessage({
                email: _email,
                subject: `${this.currentUser.userName} send you a post.`,
                userName: this.currentUser.userName,
                avatar: this.currentUser.avatar,
                body: this.post.body,
                img: this.post.previewImage,
                href: window.location.href
            })
            .pipe()
            .subscribe();
    }

    public close() {
        this.dialogRef.close(false);
    }
}
