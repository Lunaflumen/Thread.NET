import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Post } from 'src/app/models/post/post';
import { AuthenticationService } from 'src/app/services/auth.service';
import { AuthDialogService } from 'src/app/services/auth-dialog.service';
import { empty, Observable, Subject } from 'rxjs';
import { DialogType } from 'src/app/models/common/auth-dialog-type';
import { LikeService } from 'src/app/services/like.service';
import { DislikeService } from 'src/app/services/dislike.service';
import { NewComment } from 'src/app/models/comment/new-comment';
import { CommentService } from 'src/app/services/comment.service';
import { User } from 'src/app/models/user';
import { Comment } from 'src/app/models/comment/comment';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { MainThreadComponent } from '../main-thread/main-thread.component';
import { DeletePostService } from 'src/app/services/delete-post.service';
import { ImgurService } from 'src/app/services/imgur.service';
import { PostService } from 'src/app/services/post.service';
import { NewPost } from 'src/app/models/post/new-post';
import { Reaction } from 'src/app/models/reactions/reaction';
import { NegativeReaction } from 'src/app/models/reactions/negative-reaction';
import { ShowMoreReactionsService } from 'src/app/services/show-more-reactions.service';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { ShareService } from 'src/app/services/share.service';


@Component({
    selector: 'app-post',
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.sass']
})
export class PostComponent implements OnInit, OnDestroy {
    @Input() public post: Post;
    @Input() public currentUser: User;
    @Input() public editionPost: NewPost;
    @Input() public reactions: Reaction[] = [];
    @Input() public negativeReactions: NegativeReaction[] = [];


    public cachedReactions: Reaction[] = [];
    public comments: Comment[] = [];
    public cachedComments: Comment[] = [];
    public imageUrl: string;
    public imageFile: File;
    public postHub: HubConnection;
    public commentHub: HubConnection;
    public showComments = false;
    public showEditPostContainer = false;
    public showDeletePostContainer = false;
    public loading = false;
    public newComment = {} as NewComment;

    private unsubscribe$ = new Subject<void>();


    public constructor(
        private authService: AuthenticationService,
        private authDialogService: AuthDialogService,
        private likeService: LikeService,
        private dislikeService: DislikeService,
        private commentService: CommentService,
        private snackBarService: SnackBarService,
        private mainThreadComponent: MainThreadComponent,
        private deletePostService: DeletePostService,
        private imgurService: ImgurService,
        private postService: PostService,
        private showMoreReactionsService: ShowMoreReactionsService,
        private shareService: ShareService
    ) { }

    public ngOnInit() {
        this.registerHub();
    }

    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public registerHub() {
        this.postHub = new HubConnectionBuilder().withUrl('https://localhost:44344/notifications/post').build();
        this.commentHub = new HubConnectionBuilder().withUrl('https://localhost:44344/notifications/comment').build();
        this.postHub.start().catch((error) => this.snackBarService.showErrorMessage(error));
        this.commentHub.start().catch((error) => this.snackBarService.showErrorMessage(error));


        this.postHub.on('EditPost', (editedPost: Post) => {
            if (editedPost.id === this.post.id) {
                this.editPostHub(editedPost);
            }
        });

        this.postHub.on('LikePost', (postId: number) => {
            if (postId === this.post.id) {
                this.likePostHub();
            }
        });

        this.postHub.on('DislikePost', (postId: number) => {
            if (postId === this.post.id) {
                this.dislikePostHub();
            }
        });

        this.commentHub.on('NewComment', (newComment: Comment, postId: number) => {
            if (newComment && postId === this.post.id) {
                this.sendCommentHub(newComment);
            }
        });

        this.commentHub.on('EditComment', (editedComment: Comment, postId: number) => {
            if (editedComment && postId === this.post.id) {
                this.editCommentHub(editedComment);
            }
        });

        this.commentHub.on('DeleteComment', (commentId: number, postId: number) => {
            if (commentId && postId === this.post.id) {
                this.deleteCommentHub(commentId);
            }
        });
    }

    public editPostHub(editedPost: Post) {
        this.post.body = editedPost.body;
        this.post.previewImage = editedPost.previewImage;
    }

    public likePostHub() {
        // update current array instantly
        let hasReaction = this.post.reactions.some((x) => x.user.id === this.currentUser.id);

        if (!hasReaction) {
            this.postService
                .SendMessage({
                    email: this.post.author.email,
                    subject: "New Like!",
                    userName: this.currentUser.userName,
                    avatar: this.currentUser.avatar,
                    body: this.post.body,
                    img: this.post.previewImage,
                    href: window.location.href
                })
                .pipe()
                .subscribe();
        }

        this.post.reactions = hasReaction
            ? this.post.reactions.filter((x) => x.user.id !== this.currentUser.id)
            : this.post.reactions.concat({ isLike: true, user: this.currentUser });

        let hasNegativeReaction = this.post.negativeReactions.some((x) => x.user.id === this.currentUser.id);

        this.post.negativeReactions = hasNegativeReaction
            ? this.post.negativeReactions.filter((x) => x.user.id !== this.currentUser.id)
            : this.post.negativeReactions;
    }

    public dislikePostHub() {
        // update current array instantly
        let hasNegativeReaction = this.post.negativeReactions.some((x) => x.user.id === this.currentUser.id);

        this.post.negativeReactions = hasNegativeReaction
            ? this.post.negativeReactions.filter((x) => x.user.id !== this.currentUser.id)
            : this.post.negativeReactions.concat({ isDislike: true, user: this.currentUser });

        let hasReaction = this.post.reactions.some((x) => x.user.id === this.currentUser.id);

        this.post.reactions = hasReaction
            ? this.post.reactions.filter((x) => x.user.id !== this.currentUser.id)
            : this.post.reactions;
    }

    public sendCommentHub(newComment: Comment) {
        if (!this.post.comments.some((x) => x.id === newComment.id)) {
            this.post.comments = this.post.comments.concat(newComment);
        }
    }

    public editCommentHub(editedComment: Comment) {
        if (!this.cachedComments.some((x) => x.id === editedComment.id)) {
            this.cachedComments = this.sortCommentArray(
                this.cachedComments.filter((x) => x.id !== editedComment.id).concat(editedComment));
        }
    }

    public toggleEditPostContainer() {
        this.showEditPostContainer = !this.showEditPostContainer;
    }

    public toggleDeletePostContainer() {
        this.showDeletePostContainer = !this.showDeletePostContainer;
    }

    public editPost() {
        const postSubscription = !this.imageFile
            ? this.postService.editPost(this.post)
            : this.imgurService.uploadToImgur(this.imageFile, 'title').pipe(
                switchMap((imageData) => {
                    this.post.previewImage = imageData.body.data.link;
                    return this.postService.editPost(this.post);
                })
            );

        this.loading = true;

        postSubscription.pipe(takeUntil(this.unsubscribe$)).subscribe(
            () => {
                this.snackBarService.showUsualMessage('Successfully updated');
                this.loading = false;
            },
            (error) => this.snackBarService.showErrorMessage(error)
        );


        this.toggleEditPostContainer();
    }

    public loadImage(target: any) {
        this.imageFile = target.files[0];

        if (!this.imageFile) {
            target.value = '';
            return;
        }

        if (this.imageFile.size / 1000000 > 5) {
            target.value = '';
            this.snackBarService.showErrorMessage(`Image can't be heavier than ~5MB`);
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => (this.imageUrl = reader.result as string));
        reader.readAsDataURL(this.imageFile);
    }

    public removeImage() {
        this.imageUrl = undefined;
        this.imageFile = undefined;
    }

    public deletePost() {
        this.deletePostService
            .deletePost(this.post)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe();

        this.mainThreadComponent.deletePostHub(this.post.id);

        this.toggleDeletePostContainer();
    }

    public toggleComments() {
        if (!this.currentUser) {
            this.catchErrorWrapper(this.authService.getUser())
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(
                    (user) => {
                        if (user) {
                            this.currentUser = user;
                            this.showComments = !this.showComments;
                        }
                    });

            this.commentService
                .getComments()
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(
                    (resp) => {
                        this.comments = this.cachedComments = resp.body;
                    });

            return;
        }

        this.showComments = !this.showComments;
    }

    public deleteCommentHub(currentCommentId: number) {
        this.post.comments = this.post.comments.filter((x) => x.id !== currentCommentId);
    }


    public like() {
        if (!this.currentUser) {
            this.catchErrorWrapper(this.authService.getUser())
                .pipe(
                    switchMap((userResp) => this.likeService.like(this.post, userResp)),
                    takeUntil(this.unsubscribe$)
                )
                .subscribe((post) => (this.post = post));

            return;
        }

        this.likeService
            .like(this.post, this.currentUser)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((post) => (this.post = post));
    }

    public dislike() {
        if (!this.currentUser) {
            this.catchErrorWrapper(this.authService.getUser())
                .pipe(
                    switchMap((userResp) => this.dislikeService.dislike(this.post, userResp)),
                    takeUntil(this.unsubscribe$)
                )
                .subscribe((post) => (this.post = post));

            return;
        }

        this.dislikeService
            .dislike(this.post, this.currentUser)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((post) => (this.post = post));
    }

    public share() {
        if (!this.currentUser) {
            this.catchErrorWrapper(this.authService.getUser())
                .pipe()
                .subscribe();

            return;
        }

        this.shareService.share(this.currentUser, this.post);
    }

    public sendComment() {
        this.newComment.authorId = this.currentUser.id;
        this.newComment.postId = this.post.id;

        this.commentService
            .createComment(this.newComment)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                (resp) => {
                    if (resp) {
                        this.newComment.body = undefined;
                    }
                },
                (error) => this.snackBarService.showErrorMessage(error)
            );
    }

    public openAuthDialog() {
        this.authDialogService.openAuthDialog(DialogType.SignIn);
    }

    public showReactions(wich: boolean) {
        if (wich === true)
            this.showMoreReactionsService.openMorePositiveReactions(this.post.reactions);
        else
            this.showMoreReactionsService.openMoreNegativeReactions(this.post.negativeReactions);
    }

    private catchErrorWrapper(obs: Observable<User>) {
        return obs.pipe(
            catchError(() => {
                this.openAuthDialog();
                return empty();
            })
        );
    }

    private sortCommentArray(array: Comment[]): Comment[] {
        return array.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
}
