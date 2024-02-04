// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { SignalRService } from '../../../services/general/signal-r.service';
import { UsersService } from '../../../services/users/users.service';
import {
    Component,
    ElementRef,
    OnInit,
    ChangeDetectionStrategy,
    ViewChild,
    ViewEncapsulation,
    OnDestroy,
    Input,
    HostListener
} from '@angular/core';
import { Observable } from 'rxjs';
import { ChatThread } from 'src/app/models/chat-thread.model';
import { ChatMessage } from 'src/app/models/chat-message.model';
import { User } from 'src/app/models/user.model';
import { ChatMessagesService } from 'src/app/services/chat/chat-messages.service';
import { ChatThreadsService } from 'src/app/services/chat/chat-threads.service';
import { map } from 'rxjs/operators';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { fadeInOut } from 'src/app/shared/animations';
import { ThemeManager } from 'src/app/shared/theme-manager';

@Component({
    selector: 'chat-window',
    templateUrl: './chat-window.component.html',
    styleUrls: ['./chat-window.component.scss'],
    animations: [fadeInOut],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ChatWindowComponent implements OnInit, OnDestroy {
    @Input() currentThread: ChatThread;

    @ViewChild('scrollBar') scrollBar?: PerfectScrollbarComponent;

    messages$: Observable<ChatMessage[]>;
    messagesSubscription: any;
    draftMessage: ChatMessage;

    currentUser: User;

    themeManagerSubscription: any;
    isDarkTheme: boolean;

    constructor(public messagesService: ChatMessagesService,
        public threadsService: ChatThreadsService,
        private usersService: UsersService,
        private signalRService: SignalRService,
        private themeManager: ThemeManager,
        public el: ElementRef) {
    }

    ngOnInit(): void {
        this.messages$ = this.threadsService.currentThreadMessages
            .pipe(
                map((messages: ChatMessage[]) => messages.sort((m1: ChatMessage, m2: ChatMessage) => m1.sentAt > m2.sentAt ? 1 : -1))
            );

        this.draftMessage = new ChatMessage();

        this.currentUser = this.usersService.currentUser;

        this.messagesSubscription = this.messages$
            .subscribe(
                (messages: Array<ChatMessage>) => {
                    setTimeout(() => {
                        this.scrollToBottom();
                    });
                });

        this.initializeVariablesBasedOnThemeColor();
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

    onEnter(event: any): void {
        this.sendMessage();
        event.preventDefault();
    }

    sendMessage(): void {
        const message: ChatMessage = this.draftMessage;
        message.author = this.currentUser;
        message.thread = this.currentThread;
        this.signalRService.sendChatMessage(message);
        this.draftMessage = new ChatMessage();
    }

    scrollToBottom(): void {
        this.scrollBar.directiveRef.scrollToBottom();
    }

    getImageForThread(thread: ChatThread) {
        return require('../../../assets/images/Avatars/' + thread.avatarSrc);
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        if (this.messagesSubscription) {
            this.messagesSubscription.unsubscribe();
        }
        if (this.themeManagerSubscription) {
            this.themeManagerSubscription.unsubscribe();
        }
    }
}
