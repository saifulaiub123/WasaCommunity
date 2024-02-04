// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatMessage } from '../../models/chat-message.model';
import { UsersEndpoint } from '../users/users-endpoint.service';

@Injectable()
export class ChatService {

    constructor(private usersEndpoint: UsersEndpoint) {
    }

    getChatMessagesForUser(userId: string): Observable<ChatMessage[]> {
        return this.usersEndpoint.getChatMessagesForUserEndpoint<ChatMessage[]>(userId);
    }

    markChatMessagesForThreadAsRead(userId: string): Observable<ChatMessage[]> {
        return this.usersEndpoint.getMarkChatMessagesForThreadAsReadEndpoint<ChatMessage[]>(userId);
    }
}

