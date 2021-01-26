import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Comment } from 'src/app/models/comment/comment';
import { User } from 'src/app/models/user';
import { empty, Observable, Subject } from 'rxjs';
import { LikeCommentService } from 'src/app/services/like-comment.service';
import { DislikeCommentService } from 'src/app/services/dislike-comment.service';
import { AuthenticationService } from 'src/app/services/auth.service';
import { AuthDialogService } from 'src/app/services/auth-dialog.service';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { DialogType } from 'src/app/models/common/auth-dialog-type';
import { UserService } from 'src/app/services/user.service';
import { DeleteCommentService } from 'src/app/services/delete-comment.service';
import { PostComponent } from '../post/post.component';
import { CommentService } from 'src/app/services/comment.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ShowMoreReactionsService } from 'src/app/services/show-more-reactions.service';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.sass']
})
export class CommentComponent implements OnInit, OnDestroy {
    @Input() public comment: Comment;
    @Input() public currentUser: User;

    public commentHub: HubConnection;

    private unsubscribe$ = new Subject<void>();

    public showEditCommentContainer = false;
    public loading = false;

    public constructor(
        private authService: AuthenticationService,
        private authDialogService: AuthDialogService,
        private likeCommentService: LikeCommentService,
        private dislikeCommentService: DislikeCommentService,
        private userService: UserService,
        private deleteCommentService: DeleteCommentService,
        private postComponent: PostComponent,
        private snackBarService: SnackBarService,
        private commentService: CommentService,
        private showMoreReactionsService: ShowMoreReactionsService
    ) { }

    public ngOnInit() {
        this.authService
            .getUser()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((currentUser) => (this.currentUser = this.userService.copyUser(currentUser)), (error) => this.snackBarService.showErrorMessage(error));
        this.registerHub();
    }

    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public registerHub() {
        this.commentHub = new HubConnectionBuilder().withUrl('https://localhost:44344/notifications/comment').build();
        this.commentHub.start().catch((error) => this.snackBarService.showErrorMessage(error));

        this.commentHub.on('EditComment', (editedComment: Comment, postId: number) => {
            if (editedComment) {
                this.editCommentHub(editedComment);
            }
        });

        this.commentHub.on('LikeComment', (commentId: number) => {
            if (commentId === this.comment.id) {
                this.likeCommentHub();
            }
        });

        this.commentHub.on('DislikeComment', (commentId: number) => {
            if (commentId === this.comment.id) {
                this.dislikeCommentHub();
            }
        });
    }

    public editCommentHub(editedComment: Comment) {
        this.comment.body = editedComment.body;
    }

    public likeCommentHub() {
        // update current array instantly
        let hasReaction = this.comment.reactions.some((x) => x.user.id === this.currentUser.id);

        this.comment.reactions = hasReaction
            ? this.comment.reactions.filter((x) => x.user.id !== this.currentUser.id)
            : this.comment.reactions.concat({ isLike: true, user: this.currentUser });

        let hasNegativeReaction = this.comment.negativeReactions.some((x) => x.user.id === this.currentUser.id);

        this.comment.negativeReactions = hasNegativeReaction
            ? this.comment.negativeReactions.filter((x) => x.user.id !== this.currentUser.id)
            : this.comment.negativeReactions;
    }

    public dislikeCommentHub() {
        // update current array instantly
        let hasNegativeReaction = this.comment.negativeReactions.some((x) => x.user.id === this.currentUser.id);

        this.comment.negativeReactions = hasNegativeReaction
            ? this.comment.negativeReactions.filter((x) => x.user.id !== this.currentUser.id)
            : this.comment.negativeReactions.concat({ isDislike: true, user: this.currentUser });

        let hasReaction = this.comment.reactions.some((x) => x.user.id === this.currentUser.id);

        this.comment.reactions = hasReaction
            ? this.comment.reactions.filter((x) => x.user.id !== this.currentUser.id)
            : this.comment.reactions;
    }


    public toggleEditCommentContainer() {
        this.showEditCommentContainer = !this.showEditCommentContainer;
    }

    public editComment() {
        const commentSubscription = this.commentService.editComment(this.comment)

        this.loading = true;

        commentSubscription.pipe(takeUntil(this.unsubscribe$)).subscribe(
            () => {
                this.snackBarService.showUsualMessage('Successfully updated');
                this.loading = false;
            },
            (error) => this.snackBarService.showErrorMessage(error)
        );


        this.toggleEditCommentContainer();
    }

    public deleteComment() {
        this.deleteCommentService
            .deleteComment(this.comment)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe();

        this.postComponent.deleteCommentHub(this.comment.id);
    }

    public likeComment() {
        if (!this.currentUser) {
            this.catchErrorWrapper(this.authService.getUser())
                .pipe(
                    switchMap((userResp) => this.likeCommentService.likeComment(this.comment, userResp)),
                    takeUntil(this.unsubscribe$)
                )
                .subscribe((comment) => (this.comment = comment));

            return;
        }

        this.likeCommentService
            .likeComment(this.comment, this.currentUser)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((comment) => (this.comment = comment));
    }

    public dislikeComment() {
        if (!this.currentUser) {
            this.catchErrorWrapper(this.authService.getUser())
                .pipe(
                    switchMap((userResp) => this.dislikeCommentService.dislikeComment(this.comment, userResp)),
                    takeUntil(this.unsubscribe$)
                )
                .subscribe((comment) => (this.comment = comment));

            return;
        }

        this.dislikeCommentService
            .dislikeComment(this.comment, this.currentUser)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((comment) => (this.comment = comment));
    }

    public openAuthDialog() {
        this.authDialogService.openAuthDialog(DialogType.SignIn);
    }

    public showReactions(wich: boolean) {
        if (wich === true)
            this.showMoreReactionsService.openMorePositiveReactions(this.comment.reactions);
        else
            this.showMoreReactionsService.openMoreNegativeReactions(this.comment.negativeReactions);
    }

    private catchErrorWrapper(obs: Observable<User>) {
        return obs.pipe(
            catchError(() => {
                this.openAuthDialog();
                return empty();
            })
        );
    }
}

