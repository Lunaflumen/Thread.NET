import { Injectable } from '@angular/core';
import { AuthenticationService } from './auth.service';
import { Post } from '../models/post/post';
import { NewNegativeReaction } from '../models/reactions/new-negative-reaction';
import { PostService } from './post.service';
import { User } from '../models/user';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DislikeService {
    public constructor(private authService: AuthenticationService, private postService: PostService) { }

    public dislike(post: Post, currentUser: User) {
        const innerPost = post;

        const negativeReaction: NewNegativeReaction = {
            entityId: innerPost.id,
            isDislike: true,
            userId: currentUser.id
        };

        let hasNegativeReaction = innerPost.negativeReactions.some((x) => x.user.id === currentUser.id);

        return this.postService.dislike(negativeReaction).pipe(
            map(() => innerPost),
            catchError(() => {
                // revert current array changes in case of any error
                innerPost.negativeReactions = hasNegativeReaction
                    ? innerPost.negativeReactions.filter((x) => x.user.id !== currentUser.id)
                    : innerPost.negativeReactions.concat({ isDislike: true, user: currentUser });

                return of(innerPost);
            })
        );
    }
}