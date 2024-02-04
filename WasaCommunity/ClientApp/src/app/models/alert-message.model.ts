
// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { MinimalUser } from './minimal-user.model';
import { AlertRecipient } from './alert-recipient.model';

export class AlertMessage {

    constructor(public id?: string, public author?: MinimalUser, public title?: string,
                public body?: string, public sentAt?: Date, public recipients?: AlertRecipient[]) { }
}
