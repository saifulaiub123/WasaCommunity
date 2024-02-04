// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { AlertRecipient } from './alert-recipient.model';
import { AlertMessage } from './alert-message.model';

export class Alert {

    constructor(public alertRecipient?: AlertRecipient, public alertMessage?: AlertMessage) { }
}
