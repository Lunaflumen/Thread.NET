import { Injectable } from '@angular/core';
import { AuthenticationService } from './auth.service';
import { Post } from '../models/post/post';
import { PostService } from './post.service';

@Injectable({ providedIn: 'root' })

export class DeletePostService {
    public constructor(private authService: AuthenticationService, private postService: PostService) { }


    public deletePost(post: Post) {
        return this.postService.deletePost(post.id);
    }
}
