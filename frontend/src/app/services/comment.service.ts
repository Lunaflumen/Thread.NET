import { Injectable } from '@angular/core';
import { HttpInternalService } from './http-internal.service';
import { NewComment } from '../models/comment/new-comment';
import { Comment } from '../models/comment/comment';
import { NewReaction } from '../models/reactions/new-reaction';
import { NewNegativeReaction } from '../models/reactions/new-negative-reaction';

@Injectable({ providedIn: 'root' })
export class CommentService {
    public routePrefix = '/api/comments';

    constructor(private httpService: HttpInternalService) { }

    public getComments() {
        return this.httpService.getFullRequest<Comment[]>(`${this.routePrefix}`);
    }

    public createComment(post: NewComment) {
        return this.httpService.postFullRequest<Comment>(`${this.routePrefix}`, post);
    }

    public editComment(comment: Comment) {
        return this.httpService.putFullRequest<Comment>(`${this.routePrefix}`, comment);
    }

    public deleteComment(id: number) {
        return this.httpService.deleteFullRequest(`${this.routePrefix}/${id}`, id);
    }

    public likeComment(reaction: NewReaction) {
        return this.httpService.postFullRequest<Comment>(`${this.routePrefix}/likeComment`, reaction);
    }

    public dislikeComment(reaction: NewNegativeReaction) {
        return this.httpService.postFullRequest<Comment>(`${this.routePrefix}/dislikeComment`, reaction);
    }
}
