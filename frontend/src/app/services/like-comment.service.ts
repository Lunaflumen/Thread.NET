import { Injectable } from '@angular/core';
import { AuthenticationService } from './auth.service';
import { Comment } from '../models/comment/comment';
import { NewReaction } from '../models/reactions/new-reaction';
import { CommentService } from './comment.service';
import { User } from '../models/user';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })

export class LikeCommentService {
    public constructor(private authService: AuthenticationService, private commentService: CommentService) { }


    public likeComment(comment: Comment, currentUser: User) {
        const innerComment = comment;

        const reaction: NewReaction = {
            entityId: innerComment.id,
            isLike: true,
            userId: currentUser.id
        };

        let hasReaction = innerComment.reactions.some((x) => x.user.id === currentUser.id);

        return this.commentService.likeComment(reaction).pipe(
            map(() => innerComment),
            catchError(() => {
                // revert current array changes in case of any error
                innerComment.reactions = hasReaction
                    ? innerComment.reactions.filter((x) => x.user.id !== currentUser.id)
                    : innerComment.reactions.concat({ isLike: true, user: currentUser });

                return of(innerComment);
            })
        );
    }
}
