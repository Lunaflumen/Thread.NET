import { Component, Inject, OnDestroy, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subject } from 'rxjs';
import { Reaction } from 'src/app/models/reactions/reaction';
import { NegativeReaction } from 'src/app/models/reactions/negative-reaction';

@Component({
    templateUrl: './show-more-reactions.component.html',
    styleUrls: ['./show-more-reactions.component.sass']
})
export class ShowMoreReactionsComponent implements OnDestroy {
    @Input()
    public reactions: Reaction[] = [];
    public negativeReactions: NegativeReaction[] = [];

    public reaction: Reaction;
    public negativeReaction: NegativeReaction;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private dialogRef: MatDialogRef<ShowMoreReactionsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        if (this.data.wich === true)
            this.reactions = this.data._reactions;
        else
            this.negativeReactions = this.data._negativeReactions
    }


    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public close() {
        this.dialogRef.close(false);
    }
}
