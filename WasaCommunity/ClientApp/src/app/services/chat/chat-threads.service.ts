import { UsersService } from '../users/users.service';
import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { map, combineLatest, filter } from 'rxjs/operators';
import { ChatThread } from '../../models/chat-thread.model';
import { ChatMessagesService } from './chat-messages.service';
import * as _ from 'lodash';
import { ChatMessage } from '../../models/chat-message.model';

@Injectable()
export class ChatThreadsService {

    threads: Observable<{ [key: string]: ChatThread }>;
    orderedThreads: Observable<ChatThread[]>;
    currentThread: Subject<ChatThread> =
        new BehaviorSubject<ChatThread>(new ChatThread());
    currentThreadMessages: Observable<ChatMessage[]>;
    threadsForCurrentUser: Observable<{ [key: string]: ChatThread; }>;

    constructor(private chatMessagesService: ChatMessagesService,
        private usersService: UsersService) {

        this.threads = chatMessagesService.messages.pipe(
            map((messages: ChatMessage[]) => {
                const threads: { [key: string]: ChatThread } = {};
                messages.map((message: ChatMessage) => {
                    const currentUser = this.usersService.currentUser;
                    if (message.author.id === currentUser.id) {
                        threads[message.thread.id] = threads[message.thread.id] ||
                            message.thread;
                        const messagesThread: ChatThread = threads[message.thread.id];
                        if (!messagesThread.lastMessage ||
                            messagesThread.lastMessage.sentAt < message.sentAt) {
                            messagesThread.lastMessage = message;
                        }
                    } else if (message.thread.id === currentUser.email) {
                            const chatThread = new ChatThread(message.author.email, message.author.fullName, message.author.imageUrl);
                            threads[message.author.email] = chatThread;
                            if (!chatThread.lastMessage ||
                                chatThread.lastMessage.sentAt < message.sentAt) {
                                chatThread.lastMessage = message;
                            }
                    }
                });
                return threads;
            })
        );

        this.orderedThreads = this.threads.pipe(
            map((threadGroups: { [key: string]: ChatThread }) => {
                const threads: ChatThread[] = _.values(threadGroups);
                return _.sortBy(threads, (t: ChatThread) => t.lastMessage.sentAt).reverse();
            })
        );

        this.currentThreadMessages = this.currentThread.pipe(
            combineLatest(chatMessagesService.messages,
                (currentThread: ChatThread, messages: ChatMessage[]) => {
                    if (currentThread && messages.length > 0) {
                        const currentUser = this.usersService.currentUser;
                        return _.chain(messages)
                            .filter((message: ChatMessage) =>
                                // Filter out messages that belongs to a thread that is
                                // either owned or received by the current user
                                (message.author.id === currentUser.id ||
                                    message.receiver.id === currentUser.id) &&
                                // And only render those messages that has a thread owner
                                // Or a thread receiver that is the current user
                                (message.author.email === currentThread.id ||
                                    message.receiver.email === currentThread.id))
                            .map((message: ChatMessage) => {
                                message.isRead = true;
                                return message;
                            })
                            .value();
                    } else {
                        return [];
                    }
                })
        );

        this.currentThread.subscribe(this.chatMessagesService.markThreadAsRead);
    }

    setCurrentThread(newThread: ChatThread): void {
        this.currentThread.next(newThread);
    }

}

export const chatThreadsServiceInjectables: Array<any> = [
    ChatThreadsService
];
