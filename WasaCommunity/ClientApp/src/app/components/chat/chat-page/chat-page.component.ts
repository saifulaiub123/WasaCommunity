// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { ChatThreadsService } from '../../../services/chat/chat-threads.service';
import { UsersService } from '../../../services/users/users.service';
import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { fadeInOut } from 'src/app/shared/animations';
import { ChatMessage } from 'src/app/models/chat-message.model';
import { NotificationMessagesService, MessageSeverity } from 'src/app/services/notification/notification-messages.service';
import * as _ from 'lodash';
import { User } from 'src/app/models/user.model';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { ChatThread } from 'src/app/models/chat-thread.model';
import { map, startWith } from 'rxjs/operators';
import { ActivatedRoute, Params } from '@angular/router';




@Component({
    selector: 'chat-page',
    templateUrl: './chat-page.component.html',
    styleUrls: ['./chat-page.component.scss'],
    animations: [fadeInOut]
})

export class ChatPageComponent implements OnInit, OnDestroy {
    loadingIndicator: boolean;
    showMessageSuggestions: false;

    chatRecipients = new FormControl();

    chatMessagesFromServer: ChatMessage[];
    chatMessagesFromClient: ChatMessage[];
    newMessages: ChatMessage[];

    currentUser: User = new User();

    messageRecipients: User[];
    filteredMessageRecipients: Observable<User[]>;

    chatThreads: ChatThread[];
    currentThread: ChatThread;

    routeParams: Params;

    currentThread$: any;
    currentThreadSubscription: any;
    chatThreads$: any;
    chatThreadsSubscription: any;
    routeParamsSubscription: any;
    chatMessagesSubscription: any;

    constructor(private chatThreadsService: ChatThreadsService,
        private notificationMessagesService: NotificationMessagesService,
        private usersService: UsersService,
        private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.chatThreadsService.setCurrentThread(new ChatThread());
        this.loadData();
        this.setupFilteringForMaterialAutoCompleteComponent();
    }

    private loadData() {
        this.notificationMessagesService.startLoadingMessage();
        this.loadingIndicator = true;
        this.currentUser = this.usersService.currentUser;

        this.usersService.getUsers()
            .subscribe(
                result => this.onDataLoadSuccessful(result),
                error => this.onDataLoadFailed(error)
            );
    }

    private onDataLoadSuccessful( users: User[]) {
        this.notificationMessagesService.stopLoadingMessage();
        this.loadingIndicator = false;

        this.initializeChatThreadIfAnyRouteParams(users);
        this.subscribeToCurrentListOfChatThreads();
        this.subscribeToCurrentThread();

        this.messageRecipients = users.filter(user => user.id !== this.currentUser.id && !_.some(this.chatThreads, ['id', user.email]));
    }

    private onDataLoadFailed(error: any) {
        this.notificationMessagesService.stopLoadingMessage();
        this.loadingIndicator = false;

        this.notificationMessagesService.showStickyMessage('Load Error', `Unable to retrieve chat-messages from the server.`, MessageSeverity.error, error);
    }

    private setupFilteringForMaterialAutoCompleteComponent() {
        this.filteredMessageRecipients = this.chatRecipients.valueChanges
            .pipe(startWith(''), map(value => this._filter(value)));
    }

    private subscribeToCurrentThread() {
        this.currentThread$ = this.chatThreadsService.currentThread;
        this.currentThreadSubscription = this.currentThread$.subscribe((thread: ChatThread) => {
            this.currentThread = thread;
        });
    }

    private subscribeToCurrentListOfChatThreads() {
        this.chatThreads$ = this.chatThreadsService.orderedThreads.pipe(map((chatThreads: ChatThread[]) => {
            return chatThreads.filter((chatThread: ChatThread) => chatThread.id !== this.currentUser.email);
        }));
        this.chatThreadsSubscription = this.chatThreads$.subscribe((chatThreads: ChatThread[]) => this.chatThreads = chatThreads);
    }

    private initializeChatThreadIfAnyRouteParams(users: User[]) {
        this.routeParamsSubscription = this.route.params.subscribe(params => this.routeParams = params['id']);
        if (this.routeParams !== undefined) {
            users.map((user: User) => {
                if (user.id === this.routeParams.toString()) {
                    const chatThread = new ChatThread(user.email, user.fullName, user.imageUrl);
                    this.chatThreadsService.setCurrentThread(chatThread);
                    this.currentThread = chatThread;
                }
            });
        }
    }

    newMessageThreadForUser(user: User) {
        const thread = new ChatThread(user.email, user.fullName, user.imageUrl);
        this.chatThreadsService.setCurrentThread(thread);
    }

    getAvatarForUser(user: User): string {
        return require('../../../assets/images/Avatars/' + user.imageUrl);
    }

    back() {
        this.chatThreadsService.setCurrentThread(new ChatThread());
    }

    private _filter(value: string): User[] {
        const filterValue = value.toLowerCase();
        return this.messageRecipients.filter(option => option.fullName.toLowerCase().includes(filterValue));
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        if (this.currentThreadSubscription) {
            this.currentThreadSubscription.unsubscribe();
        }
        if (this.chatThreadsSubscription) {
            this.chatThreadsSubscription.unsubscribe();
        }
        if (this.routeParamsSubscription) {
            this.routeParamsSubscription.unsubscribe();
        }
    }

    trackByFunc(item, index) {
        return item.id;
    }
}
