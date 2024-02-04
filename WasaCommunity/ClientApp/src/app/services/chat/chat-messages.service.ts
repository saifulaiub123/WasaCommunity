import { Injectable } from '@angular/core';
import { Subject, Observable, empty, of } from 'rxjs';
import { scan, filter, map, publishReplay, refCount } from 'rxjs/operators';
import { User } from '../../models/user.model';
import { ChatMessage } from '../../models/chat-message.model';
import { ChatThread } from '../../models/chat-thread.model';

const initialMessages: ChatMessage[] = [];

interface IMessagesOperation extends Function {
    // tslint:disable-next-line:callable-types
    (messages: ChatMessage[]): ChatMessage[];
}

@Injectable()
export class ChatMessagesService {

    newMessages: Subject<ChatMessage> = new Subject<ChatMessage>();
    messages: Observable<ChatMessage[]>;
    updates: Subject<any> = new Subject<any>();
    create: Subject<ChatMessage> = new Subject<ChatMessage>();
    markThreadAsRead: Subject<any> = new Subject<any>();

    constructor() {
        this.initializeStreams();
    }

    initializeStreams() {
        this.messages = this.updates.pipe(
            scan((messages: ChatMessage[],
                operation: IMessagesOperation) => {
                return operation(messages);
            }, initialMessages),
            publishReplay(1),
            refCount()
        );

        this.create.pipe(map(function (message: ChatMessage): IMessagesOperation {
            return (messages: ChatMessage[]) => {
                return messages.concat(message);
            };
        }))
            .subscribe(this.updates);

        this.newMessages
            .subscribe(this.create);

        this.markThreadAsRead.pipe(
            map((thread: ChatThread) => {
                return (messages: ChatMessage[]) => {
                    return messages.map((message: ChatMessage) => {
                        if (message.thread.id === thread.id) {
                            message.isRead = true;
                        }
                        return message;
                    });
                };
            })
        ).subscribe(this.updates);
    }


    addMessage(message: ChatMessage): void {
        this.newMessages.next(message);
    }

    messagesForThreadUser(thread: ChatThread, user: User): Observable<ChatMessage> {
        return this.newMessages.pipe(
            filter((message: ChatMessage) => {
                return (message.thread.id === thread.id) &&
                    (message.author.id !== user.id);
            })
        );
    }
}

export const chatMessagesServiceInjectables: Array<any> = [
    ChatMessagesService
];
