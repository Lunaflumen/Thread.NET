import { Injectable } from '@angular/core';
import { AuthenticationService } from './auth.service';
import { Comment } from '../models/comment/comment';
import { CommentService } from './comment.service';

@Injectable({ providedIn: 'root' })

export class DeleteCommentService {
    public constructor(private authService: AuthenticationService, private commentService: CommentService) { }


    public deleteComment(comment: Comment) {
        return this.commentService.deleteComment(comment.id);
    }
}
