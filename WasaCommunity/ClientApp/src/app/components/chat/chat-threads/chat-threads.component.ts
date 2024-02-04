// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { ChatThread } from 'src/app/models/chat-thread.model';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'chat-threads',
    templateUrl: './chat-threads.component.html',
    styleUrls: ['./chat-threads.component.scss']
})
export class ChatThreadsComponent {
    @Input() threads: ChatThread[];

    constructor() {
    }

    trackByFunc(item, index) {
        return item.id;
    }
}
