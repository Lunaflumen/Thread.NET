import { Injectable, OnDestroy } from '@angular/core';
import { ShowMoreReactionsComponent } from '../components/show-more-reactions/show-more-reactions.component';
import { MatDialog } from '@angular/material';
import { Subject } from 'rxjs';
import { Reaction } from '../models/reactions/reaction';
import { NegativeReaction } from '../models/reactions/negative-reaction';

@Injectable({ providedIn: 'root' })
export class ShowMoreReactionsService implements OnDestroy {
    private unsubscribe$ = new Subject<void>();

    public constructor(private dialog: MatDialog) { }

    public openMorePositiveReactions(reactions: Reaction[]) {
        const dialog = this.dialog.open(ShowMoreReactionsComponent, {

            minWidth: 300,
            autoFocus: true,
            backdropClass: 'dialog-backdrop',
            data: {
                wich: true,
                _reactions: reactions
            }
        });
    }

    public openMoreNegativeReactions(negativeReactions: NegativeReaction[]) {
        const dialog = this.dialog.open(ShowMoreReactionsComponent, {

            minWidth: 300,
            autoFocus: true,
            backdropClass: 'dialog-backdrop',
            data: {
                wich: false,
                _negativeReactions: negativeReactions
            }
        });
    }

    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
