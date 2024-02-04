import { ChatService } from './../../../services/chat/chat.service';
import { UsersService } from './../../../services/users/users.service';
import { ChatThreadsService } from 'src/app/services/chat/chat-threads.service';
import { ChatMessagesService } from 'src/app/services/chat/chat-messages.service';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ChatMessage } from 'src/app/models/chat-message.model';
import { ChatThread } from 'src/app/models/chat-thread.model';
import * as _ from 'lodash';
import { combineLatest } from 'rxjs/operators';
import { User } from 'src/app/models/user.model';
import { NotificationMessagesService, MessageSeverity } from 'src/app/services/notification/notification-messages.service';

@Component({
    selector: 'chat-notification',
    templateUrl: './chat-notification.component.html',
    styleUrls: ['./chat-notification.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatNotificationComponent implements OnInit {
    unreadMessagesCount: number;
    currentUser: User;
    chatMessagesFromServer: ChatMessage[];
    chatMessagesSubscription: any;
    chatMessagesFromClient: ChatMessage[];
    newMessages: any;

    constructor(public chatMessagesService: ChatMessagesService,
        public chatThreadsService: ChatThreadsService,
        private usersService: UsersService,
        private chatService: ChatService,
        private notificationMessagesService: NotificationMessagesService,
        private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.loadData();
        this.chatMessagesService.messages.pipe(
            combineLatest(
                this.chatThreadsService.currentThread,
                (messages: ChatMessage[], currentThread: ChatThread) =>
                    [currentThread, messages])
        )
            .subscribe(([currentThread, messages]: [ChatThread, ChatMessage[]]) => {
                this.unreadMessagesCount =
                    _.reduce(
                        messages,
                        (sum: number, m: ChatMessage) => {
                            const messageIsInCurrentThread: boolean = m.thread &&
                                currentThread &&
                                (currentThread.id === m.thread.id);
                            const isAuthoredByCurrentUser = m.author.id === this.currentUser.id;
                            if (m && !m.isRead && !messageIsInCurrentThread && !isAuthoredByCurrentUser) {
                                sum = sum + 1;
                            }
                            return sum;
                        },
                        0);
            });
    }

    private loadData() {
        this.currentUser = this.usersService.currentUser;

            this.chatService.getChatMessagesForUser(this.currentUser.id)
            .subscribe(
                result => this.onDataLoadSuccessful(result),
                error => this.onDataLoadFailed(error)
            );
    }

    private onDataLoadSuccessful(chatMessagesFromServer: ChatMessage[]) {
        this.chatMessagesFromServer = chatMessagesFromServer;
        this.chatMessagesSubscription = this.chatMessagesService.messages.subscribe(
            (chatMessagesFromClient: ChatMessage[]) => this.chatMessagesFromClient = chatMessagesFromClient
        );

        if (this.newMessagesFromServer()) {
            this.newMessages = _.differenceBy(this.chatMessagesFromServer, this.chatMessagesFromClient, 'id');
            this.newMessages.map((message: ChatMessage) => this.chatMessagesService.addMessage(message));
        }
    }

    private onDataLoadFailed(error: any) {
        this.notificationMessagesService.showStickyMessage('Load Error', `Unable to retrieve chat-messages from the server.`, MessageSeverity.error, error);
    }

    private newMessagesFromServer(): boolean {
        if (this.chatMessagesFromClient == null && this.chatMessagesFromServer != null) {
            return true;
        } else if (this.chatMessagesFromServer.length > this.chatMessagesFromClient.length) {
            return true;
        } else {
            return false;
        }
    }

    ngAfterContentChecked() {
        this.changeDetectorRef.detectChanges();
    }

}
