// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { UsersService } from './../../../services/users/users.service';
import { Component, OnInit, Input, OnDestroy, HostListener } from '@angular/core';
import { ChatThread } from 'src/app/models/chat-thread.model';
import { ChatThreadsService } from 'src/app/services/chat/chat-threads.service';
import { ThemeManager } from 'src/app/shared/theme-manager';
import { ChatService } from 'src/app/services/chat/chat.service';
import { combineLatest } from 'rxjs/operators';
import { ChatMessagesService } from './../../../services/chat/chat-messages.service';
import { ChatMessage } from 'src/app/models/chat-message.model';
import * as _ from 'lodash';

@Component({
    selector: 'chat-thread',
    templateUrl: './chat-thread.component.html',
    styleUrls: ['./chat-thread.component.scss']
})
export class ChatThreadComponent implements OnInit, OnDestroy {
    @Input() thread: ChatThread;
    selected = false;
    currentThread$: any;
    currentThreadSubscription: any;
    themeManagerSubscription: any;
    isDarkTheme: boolean;
    color: string;
    unreadMessagesCount: any;

    constructor(public threadsService: ChatThreadsService, private themeManager: ThemeManager,
                private chatService: ChatService, private usersService: UsersService,
                private chatMessagesService: ChatMessagesService) {
    }

    ngOnInit(): void {

        this.initializeVariablesBasedOnThemeColor();
    }

    ngOnChanges() {
        this.currentThread$ = this.threadsService.currentThread;
        this.currentThreadSubscription = this.currentThread$
            .subscribe((currentThread: ChatThread) => {
                this.selected = currentThread &&
                    this.thread &&
                    (currentThread.id === this.thread.id);
            });

        this.chatMessagesService.messages.pipe(
            combineLatest(
                this.threadsService.currentThread,
                (messages: ChatMessage[], currentThread: ChatThread) =>
                    [currentThread, messages])
        )
            .subscribe(([currentThread, messages]: [ChatThread, ChatMessage[]]) => {
                this.unreadMessagesCount =
                    _.reduce(
                        messages,
                        (sum: number, m: ChatMessage) => {
                            if (m && !m.isRead && (this.thread.id === m.author.email)) {
                                sum = sum + 1;
                            }
                            return sum;
                        },
                        0);
            });
    }

    private initializeVariablesBasedOnThemeColor() {
        this.themeManagerSubscription = this.themeManager._darkTheme.subscribe(isDarkTheme => {
            if (isDarkTheme === true) {
                this.isDarkTheme = true;
            } else {
                this.isDarkTheme = false;
            }
        });
    }

    clicked(event: any): void {
        this.chatService.markChatMessagesForThreadAsRead(this.usersService.currentUser.id)
            .subscribe();
        // Below code called twice on purpose so that chat-notification-badge gets cleared
        this.threadsService.setCurrentThread(this.thread);
        this.threadsService.setCurrentThread(this.thread);
        event.preventDefault();
    }

    getImageForThread(thread: ChatThread) {
        return require('../../../assets/images/Avatars/' + thread.avatarSrc);
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        if (this.currentThreadSubscription) {
            this.currentThreadSubscription.unsubscribe();
        }
        if (this.themeManagerSubscription) {
            this.themeManagerSubscription.unsubscribe();
        }
    }

}
