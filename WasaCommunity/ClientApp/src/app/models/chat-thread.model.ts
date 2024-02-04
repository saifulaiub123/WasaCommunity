// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { LastMessage } from './last-message.model';


 export class ChatThread {

   constructor(public id?: string, public name?: string,
               public avatarSrc?: string, public lastMessage?: LastMessage) {
   }
 }
