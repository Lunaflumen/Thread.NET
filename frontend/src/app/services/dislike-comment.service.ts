import { Injectable } from '@angular/core';
import { AuthenticationService } from './auth.service';
import { Comment } from '../models/comment/comment';
import { NewNegativeReaction } from '../models/reactions/new-negative-reaction';
import { CommentService } from './comment.service';
import { User } from '../models/user';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })

export class DislikeCommentService {
    public constructor(private authService: AuthenticationService, private commentService: CommentService) { }


    public dislikeComment(comment: Comment, currentUser: User) {
        const innerComment = comment;

        const negativeReaction: NewNegativeReaction = {
            entityId: innerComment.id,
            isDislike: true,
            userId: currentUser.id
        };

        let hasNegativeReaction = innerComment.negativeReactions.some((x) => x.user.id === currentUser.id);

        return this.commentService.dislikeComment(negativeReaction).pipe(
            map(() => innerComment),
            catchError(() => {
                // revert current array changes in case of any error
                innerComment.negativeReactions = hasNegativeReaction
                    ? innerComment.negativeReactions.filter((x) => x.user.id !== currentUser.id)
                    : innerComment.negativeReactions.concat({ isDislike: true, user: currentUser });

                return of(innerComment);
            })
        );
    }
}
