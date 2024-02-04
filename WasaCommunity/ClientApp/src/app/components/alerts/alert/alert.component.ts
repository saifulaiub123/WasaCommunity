// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { AlertMessagesService } from 'src/app/services/alerts/alert-messages.service';
import { AlertRecipient } from './../../../models/alert-recipient.model';
import { UsersService } from '../../../services/users/users.service';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { AlertDetailsComponent } from './../alert-details/alert-details.component';
import { Component, OnInit, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AlertMessage } from 'src/app/models/alert-message.model';
import { MatDialog, MatSnackBar } from '@angular/material';
import { User } from 'src/app/models/user.model';
import { NotificationMessagesService, MessageSeverity } from 'src/app/services/notification/notification-messages.service';
import { fadeInOut } from 'src/app/shared/animations';
import { LoggingService } from './../../../services/general/logging.service';

@Component({
    selector: 'alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss'],
    animations: [fadeInOut]
})
export class AlertComponent implements OnInit {
    @Input() alertRecipient: AlertRecipient;
    @Input() alertMessage: AlertMessage;
    currentUser: User = new User();
    loadingIndicator: boolean;

    constructor(private dialog: MatDialog,
        private alertsService: AlertsService,
        private usersService: UsersService,
        private alertMessagesService: AlertMessagesService,
        private snackBar: MatSnackBar,
        private notificationMessagesService: NotificationMessagesService,
        private loggingService: LoggingService) {
    }

    ngOnInit() {
        this.currentUser = this.usersService.currentUser;
    }

    getAvatarForAlert(alertMessage: AlertMessage): string {
        return require('../../../assets/images/Avatars/' + alertMessage.author.imageUrl);
    }

    showAlertDetails() {
        const dialogRef = this.dialog.open(AlertDetailsComponent,
            {
                panelClass: 'mat-dialog-md-no-padding',
                data: { alertMessage: this.alertMessage }
            });
        dialogRef.afterOpened().subscribe( () => {
            if (!this.alertRecipient.isRead) {
                this.loggingService.logUsage('/alerts/markread');
                this.alertsService.toggleIsRead(this.alertRecipient)
                .subscribe(alertRecipient => {
                    this.alertMessagesService.toggleRead(alertRecipient);
                }, error => {
                    this.notificationMessagesService.showStickyMessage('Update Error', `An error occured while attempting to mark the alert-message as read.`, MessageSeverity.error, error);
                    this.alertRecipient.isRead = true;
                });
            }
        });
    }

    delete() {
        this.snackBar.open(`Delete alert from ${this.alertMessage.author.fullName}?`, 'DELETE', { duration: 5000 })
            .onAction().subscribe(() => {
                this.alertRecipient.isDeleted = !this.alertRecipient.isDeleted;
                this.loggingService.logUsage('/alerts/markdeleted');
                this.loggingService.startPerformanceTracker('/alerts/markdeleted');
                this.notificationMessagesService.startLoadingMessage('Deleting alert...');
                this.loadingIndicator = true;

                this.alertsService.markAlertRecipientAsDeleted(this.alertRecipient)
                    .subscribe(alertRecipient => {
                        this.alertMessagesService.markDeleted(alertRecipient);
                        this.notificationMessagesService.stopLoadingMessage();
                        this.loadingIndicator = false;
                        this.loggingService.stopPerformanceTracker('/alerts/markdeleted');
                    },
                        error => {
                            this.notificationMessagesService.stopLoadingMessage();
                            this.loadingIndicator = false;

                            this.notificationMessagesService.showStickyMessage('Delete Error', `An error occured while attempting to delete the alert-message.`, MessageSeverity.error, error);
                            this.alertRecipient.isDeleted = !this.alertRecipient.isDeleted;
                        });
            });
    }

    toggleIsRead(alertRecipient: AlertRecipient) {
        this.alertRecipient.isRead = !alertRecipient.isRead;
        this.loggingService.logUsage('/alerts/toggleread');
        this.loggingService.startPerformanceTracker('/alerts/toggleread');
        this.alertsService.toggleIsRead(alertRecipient)
            .subscribe(alertRecipient => {
                this.alertMessagesService.toggleRead(alertRecipient);
                this.loggingService.stopPerformanceTracker('/alerts/toggleread');
            }, error => {
                this.notificationMessagesService.showStickyMessage('Update Error', `An error occured while attempting to mark the alert-message as read.`, MessageSeverity.error, error);
                this.alertRecipient.isRead = !alertRecipient.isRead;
            });
    }
}
