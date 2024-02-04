import { AlertsService } from './../../../services/alerts/alerts.service';
import { UsersService } from './../../../services/users/users.service';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { AlertMessagesService } from 'src/app/services/alerts/alert-messages.service';
import { AlertMessage } from 'src/app/models/alert-message.model';
import { AlertRecipient } from 'src/app/models/alert-recipient.model';
import { NotificationMessagesService, MessageSeverity } from 'src/app/services/notification/notification-messages.service';
import { Utilities } from 'src/app/shared/utilities';
import { User } from 'src/app/models/user.model';

@Component({
    selector: 'alert-notification',
    templateUrl: './alert-notification.component.html',
    styleUrls: ['./alert-notification.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertNotificationComponent implements OnInit {
    unreadMessagesCount: number;
    currentUser: User;
    alertMessagesFromServer: AlertMessage[];
    alertMessagesSubscription: any;
    alertMessagesFromClient: AlertMessage[];
    newMessages: any;

    constructor(public alertMessagesService: AlertMessagesService,
                private usersService: UsersService,
                private changeDetectorRef: ChangeDetectorRef,
                private notificationMessagesService: NotificationMessagesService,
                private alertsService: AlertsService) { }

    ngOnInit(): void {
        this.loadData();
        this.alertMessagesService.messages.pipe(
            map((alertMessages: AlertMessage[]) => {
                const alertRecipientsForCurrentUser: AlertRecipient[] = [];
                alertMessages.map((alertMessage: AlertMessage) => {
                    alertMessage.recipients.map((alertRecipient: AlertRecipient) => {
                        if (alertRecipient.recipientId === this.usersService.currentUser.id &&
                            alertRecipient.isRead === false && alertRecipient.isDeleted === false) {
                            alertRecipientsForCurrentUser.push(alertRecipient);
                        }
                    });
                });
                return alertRecipientsForCurrentUser;
            })
        ).subscribe(
            (alertRecipients: AlertRecipient[]) => {
                this.unreadMessagesCount =
                    _.reduce(
                        alertRecipients,
                        (sum: number, m: AlertRecipient) => {
                            if (m && !m.isRead) {
                                sum = sum + 1;
                            }
                            return sum;
                        },
                        0);
            }
        );

    }

    private loadData() {
        this.currentUser = this.usersService.currentUser;


        this.alertsService.getAlertMessagesForUser(this.currentUser.id)
        .subscribe(
            result => this.onDataLoadSuccessful(result),
            error => this.onDataLoadFailed(error)
        );
    }

    private onDataLoadSuccessful(alertMessagesFromServer: AlertMessage[]) {
        this.alertMessagesFromServer = alertMessagesFromServer;

        this.alertMessagesSubscription = this.alertMessagesService.messages.subscribe(
            (alertMessagesFromClient: AlertMessage[]) => this.alertMessagesFromClient = alertMessagesFromClient
        );

        if (this.newMessagesFromServer()) {
            this.newMessages = _.differenceBy(this.alertMessagesFromServer, this.alertMessagesFromClient, 'id');
            this.newMessages.map((message: AlertMessage) => this.alertMessagesService.addMessage(message));
        }

    }

    private onDataLoadFailed(error: any): void {
        this.notificationMessagesService.showStickyMessage('Load Error', `Unable to retrieve alerts from the server.\r\nErrors: "${Utilities.getHttpResponseMessage(error)}"`,
            MessageSeverity.error, error);
    }

    private newMessagesFromServer(): boolean {
        if (this.alertMessagesFromClient == null && this.alertMessagesFromServer != null) {
            return true;
        } else if (this.alertMessagesFromServer.length > this.alertMessagesFromClient.length) {
            return true;
        } else {
            return false;
        }
    }

    ngAfterContentChecked() {
        this.changeDetectorRef.detectChanges();
    }

}
