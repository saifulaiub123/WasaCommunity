// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { uuid } from '../shared/uuid';


 export class LastMessage {
   id: string;
   sentAt: Date;
   isRead: boolean;
   text: string;

   constructor(obj?: any) {
     this.id              = obj && obj.id              || uuid();
     this.isRead          = obj && obj.isRead          || false;
     this.sentAt          = obj && obj.sentAt          || new Date();
     this.text            = obj && obj.text            || null;
   }
 }


