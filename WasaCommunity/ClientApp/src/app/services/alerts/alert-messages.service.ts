import { AlertRecipient } from '../../models/alert-recipient.model';
import { HubConnection } from '@aspnet/signalr';
import { Injectable } from '@angular/core';
import { Subject, Observable, empty } from 'rxjs';
import { scan, map, publishReplay, refCount } from 'rxjs/operators';
import { AlertMessage } from '../../models/alert-message.model';
import * as moment from 'moment';
import { Alert } from '../../models/alert.model';

const initialMessages: AlertMessage[] = [];

interface IMessagesOperation extends Function {
    // tslint:disable-next-line:callable-types
    (messages: AlertMessage[]): AlertMessage[];
}

@Injectable()
export class AlertMessagesService {

    _hubConnection: HubConnection;

    newMessages: Subject<AlertMessage> = new Subject<AlertMessage>();
    messages: Observable<AlertMessage[]>;
    updates: Subject<any> = new Subject<any>();
    create: Subject<AlertMessage> = new Subject<AlertMessage>();
    markRecipientAsDeleted: Subject<any> = new Subject<any>();
    markRecipientAsRead: Subject<any> = new Subject<any>();
    toggleReadForRecipient: Subject<any> = new Subject<any>();

    alertsCreatedToday: Observable<Alert[]>;
    alertsCreatedAWeekAgo: Observable<Alert[]>;
    alertsCreatedAMonthAgo: Observable<Alert[]>;
    alertsCreatedMoreThanAMonthAgo: Observable<Alert[]>;

    constructor() {
        this.initializeStreams();
    }

    initializeStreams() {
        this.messages = this.updates.pipe(
            scan((messages: AlertMessage[],
                operation: IMessagesOperation) => {
                return operation(messages);
            }, initialMessages),
            map((messages: AlertMessage[]) => messages.sort((m1: AlertMessage, m2: AlertMessage) => m1.sentAt > m2.sentAt ? -1 : 1)),
            publishReplay(1),
            refCount()
        );

        this.create.pipe(map(function (message: AlertMessage): IMessagesOperation {
            return (messages: AlertMessage[]) => {
                return messages.concat(message);
            };
        }))
            .subscribe(this.updates);

        this.newMessages
            .subscribe(this.create);


        this.markRecipientAsDeleted.pipe(
            map((recipient: AlertRecipient) => {
                return (messages: AlertMessage[]) => {
                    return messages.map((message: AlertMessage) => {
                        message.recipients.map((alertRecipient: AlertRecipient) => {
                            if (alertRecipient.recipientId === recipient.recipientId
                                && alertRecipient.alertId === recipient.alertId) {
                                alertRecipient.isDeleted = recipient.isDeleted;
                            }
                        });
                        return message;
                    });
                };
            })
        ).subscribe(this.updates);

        this.markRecipientAsRead.pipe(
            map((recipient: AlertRecipient) => {
                return (messages: AlertMessage[]) => {
                    return messages.map((message: AlertMessage) => {
                        message.recipients.map((alertRecipient: AlertRecipient) => {
                            if (alertRecipient.recipientId === recipient.recipientId
                                && alertRecipient.alertId === recipient.alertId) {
                                alertRecipient.isRead = true;
                            }
                        });
                        return message;
                    });
                };
            })
        ).subscribe(this.updates);

        this.toggleReadForRecipient.pipe(
            map((recipient: AlertRecipient) => {
                return (messages: AlertMessage[]) => {
                    return messages.map((message: AlertMessage) => {
                        message.recipients.map((alertRecipient: AlertRecipient) => {
                            if (alertRecipient.recipientId === recipient.recipientId
                                && alertRecipient.alertId === recipient.alertId) {
                                alertRecipient.isRead = recipient.isRead;
                            }
                        });
                        return message;
                    });
                };
            })
        ).subscribe(this.updates);

        this.alertsCreatedToday = this.messages.pipe(
            map((alertMessages: AlertMessage[]) => {
                const alerts: Alert[] = [];
                alertMessages.map((alertMessage: AlertMessage) => {
                    alertMessage.recipients.map((alertRecipient: AlertRecipient) => {
                        if (this.wasCreatedToday(alertMessage)) {
                            const alert = new Alert(alertRecipient, alertMessage);
                            alerts.push(alert);
                        }
                    });
                });
                return alerts;
            })
        );

        this.alertsCreatedAWeekAgo = this.messages.pipe(
            map((alertMessages: AlertMessage[]) => {
                const alerts: Alert[] = [];
                alertMessages.map((alertMessage: AlertMessage) => {
                    alertMessage.recipients.map((alertRecipient: AlertRecipient) => {
                        if (this.wasCreatedBetweenTodayAndAWeekAgo(alertMessage)) {
                            const alert = new Alert(alertRecipient, alertMessage);
                            alerts.push(alert);
                        }
                    });
                });
                return alerts;
            })
        );

        this.alertsCreatedAMonthAgo = this.messages.pipe(
            map((alertMessages: AlertMessage[]) => {
                const alerts: Alert[] = [];
                alertMessages.map((alertMessage: AlertMessage) => {
                    alertMessage.recipients.map((alertRecipient: AlertRecipient) => {
                        if (this.wasCreatedBetweenOneWeekAndOneMonthAgo(alertMessage)) {
                            const alert = new Alert(alertRecipient, alertMessage);
                            alerts.push(alert);
                        }
                    });
                });
                return alerts;
            })
        );

        this.alertsCreatedMoreThanAMonthAgo = this.messages.pipe(
            map((alertMessages: AlertMessage[]) => {
                const alerts: Alert[] = [];
                alertMessages.map((alertMessage: AlertMessage) => {
                    alertMessage.recipients.map((alertRecipient: AlertRecipient) => {
                        if (this.wasCreatedMoreThanOneMonthAgo(alertMessage)) {
                            const alert = new Alert(alertRecipient, alertMessage);
                            alerts.push(alert);
                        }
                    });
                });
                return alerts;
            })
        );

    }


    addMessage(message: AlertMessage): void {
        this.newMessages.next(message);
    }

    markDeleted(recipient: AlertRecipient): void {
        this.markRecipientAsDeleted.next(recipient);
    }

    toggleRead(alertRecipient: AlertRecipient): void {
        this.toggleReadForRecipient.next(alertRecipient);
    }

    markRead(recipient: AlertRecipient): void {
        this.markRecipientAsRead.next(recipient);
    }

    wasCreatedToday(alertMessage: AlertMessage): boolean {
        const today = moment();
        const alertSentAt = moment(alertMessage.sentAt);

        return moment(alertSentAt).isSame(today, 'day');

    }

    wasCreatedBetweenTodayAndAWeekAgo(alertMessage: AlertMessage): boolean {
        const today = moment();
        const alertSentAt = moment(alertMessage.sentAt);
        const oneWeekAgo = moment(moment().subtract(7, 'days'));

        return moment(alertSentAt).isBetween(oneWeekAgo, today, 'day');
    }

    wasCreatedBetweenOneWeekAndOneMonthAgo(alertMessage: AlertMessage): boolean {
        const alertSentAt = moment(alertMessage.sentAt);
        const oneWeekAgo = moment(moment().subtract(7, 'days'));
        const oneMonthAgo = moment(moment().subtract(1, 'months'));

        return moment(alertSentAt).isBetween(oneMonthAgo, oneWeekAgo, 'day');
    }

    wasCreatedMoreThanOneMonthAgo(alertMessage: AlertMessage): boolean {
        const alertSentAt = moment(alertMessage.sentAt);
        const oneMonthAgo = moment(moment().subtract(1, 'months'));

        return moment(alertSentAt).isBefore(oneMonthAgo, 'day');
    }

}

export const alertMessagesServiceInjectables: Array<any> = [
    AlertMessagesService
];
