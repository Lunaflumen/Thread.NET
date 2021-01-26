import { Injectable } from '@angular/core';
import { HttpInternalService } from './http-internal.service';
import { Post } from '../models/post/post';
import { NewReaction } from '../models/reactions/new-reaction';
import { NewNegativeReaction } from '../models/reactions/new-negative-reaction';
import { NewPost } from '../models/post/new-post';
import { Email } from '../models/Email/email';

@Injectable({ providedIn: 'root' })
export class PostService {
    public routePrefix = '/api/posts';

    constructor(private httpService: HttpInternalService) { }

    public getPosts() {
        return this.httpService.getFullRequest<Post[]>(`${this.routePrefix}`);
    }

    public createPost(post: NewPost) {
        return this.httpService.postFullRequest<Post>(`${this.routePrefix}`, post);
    }

    public editPost(post: Post) {
        return this.httpService.putFullRequest<Post>(`${this.routePrefix}`, post);
    }

    public deletePost(id: number) {
        return this.httpService.deleteFullRequest(`${this.routePrefix}/${id}`, id);
    }

    public like(reaction: NewReaction) {
        return this.httpService.postFullRequest<Post>(`${this.routePrefix}/like`, reaction);
    }

    public dislike(reaction: NewNegativeReaction) {
        return this.httpService.postFullRequest<Post>(`${this.routePrefix}/dislike`, reaction);
    }

    public SendMessage(mail: Email) {
        return this.httpService.postRequest(`${this.routePrefix}/email`, mail);
    }
}
