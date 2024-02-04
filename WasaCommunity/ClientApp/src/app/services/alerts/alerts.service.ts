// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Injectable } from '@angular/core';
import { AlertMessage } from '../../models/alert-message.model';
import { Observable } from 'rxjs';
import { AlertRecipient } from '../../models/alert-recipient.model';
import { UsersEndpoint } from '../users/users-endpoint.service';

@Injectable()
export class AlertsService {

    constructor(private usersEndpoint: UsersEndpoint) { }

    getAlertMessagesForUser(userId: string): Observable<AlertMessage[]> {
        return this.usersEndpoint.getAlertMessagesForUserEndpoint<AlertMessage[]>(userId);
    }

    markAlertsAsRead(userId: string) {
        return this.usersEndpoint.getMarkAlertsAsReadEndpoint<AlertRecipient[]>(userId);
    }

    toggleIsRead(alertRecipient: AlertRecipient) {
        return this.usersEndpoint.getToggleIsReadEndpoint<AlertRecipient>(alertRecipient);
    }

    markAlertRecipientAsDeleted(alertRecipient: AlertRecipient) {
        return this.usersEndpoint.getMarkAlertRecipientAsDeletedEndpoint<AlertRecipient>(alertRecipient);
    }
}
