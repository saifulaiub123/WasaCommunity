// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { User } from './user.model';
import { ChatThread } from './chat-thread.model';
import { uuid } from '../shared/uuid';
import { MinimalUser } from './minimal-user.model';


 export class ChatMessage {
   id: string;
   sentAt: Date;
   isRead: boolean;
   author: MinimalUser;
   receiver: MinimalUser;
   text: string;
   thread: ChatThread;

   constructor(obj?: any) {
     this.id              = obj && obj.id              || uuid();
     this.isRead          = obj && obj.isRead          || false;
     this.sentAt          = obj && obj.sentAt          || new Date();
     this.author          = obj && obj.author          || null;
     this.receiver        = obj && obj.receiver        || null;
     this.text            = obj && obj.text            || null;
     this.thread          = obj && obj.thread          || null;
   }
 }


