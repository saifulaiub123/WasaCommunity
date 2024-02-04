// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { ThemeManager } from './../../../shared/theme-manager';
import { OnDestroy, HostListener } from '@angular/core';
import { AlertRecipient } from './../../../models/alert-recipient.model';
import { GroupsService } from '../../../services/group/groups.service';
import { UsersService } from '../../../services/users/users.service';
import { NotificationMessagesService, MessageSeverity } from 'src/app/services/notification/notification-messages.service';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { Component, OnInit, ViewChild, AfterContentChecked, ChangeDetectorRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { fadeInOut } from '../../../shared/animations';
import { AlertMessage } from 'src/app/models/alert-message.model';
import { Utilities } from 'src/app/shared/utilities';
import { MatDialog, MatSelectionList } from '@angular/material';
import { AlertCreateComponent } from '../alert-create/alert-create.component';
import { User } from 'src/app/models/user.model';
import { Group } from 'src/app/models/group.model';
import { forkJoin, Observable } from 'rxjs';
import { AlertMessagesService } from 'src/app/services/alerts/alert-messages.service';
import { DxPopoverComponent } from 'devextreme-angular';
import * as _ from 'lodash';
import { Alert } from 'src/app/models/alert.model';
import { LoggingService } from './../../../services/general/logging.service';

@Component({
    selector: 'alerts-page',
    templateUrl: './alerts-page.component.html',
    styleUrls: ['./alerts-page.component.scss'],
    animations: [fadeInOut],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertsPageComponent implements OnInit, OnDestroy {

    @ViewChild(DxPopoverComponent) popover: DxPopoverComponent;
    @ViewChild('alertSettings') alertSettings: MatSelectionList;

    loadingIndicator: boolean;
    withAnimationOptionsVisible: boolean;

    alertMessages$: Observable<AlertMessage[]>;
    alertsCreatedToday$: Observable<Alert[]>;
    alertsCreatedAWeekAgo$: Observable<Alert[]>;
    alertsCreatedAMonthAgo$: Observable<Alert[]>;
    alertsCreatedMoreThanAMonthAgo$: Observable<Alert[]>;

    alertMessagesFromServer: AlertMessage[];
    alertMessagesFromClient: AlertMessage[];
    alertRecipients: AlertRecipient[];
    currentUser: User = new User();
    groups: Group[] = [];
    users: User[] = [];
    newMessages: AlertMessage[];

    searchTerm: string;

    showDeleted = false;
    showRead = true;
    alertMessages: AlertMessage[];
    alertMessagesSubscription: any;
    alertsSubscription: any;
    themeManagerSubscription: any;
    isDarkTheme: boolean;

    constructor(private alertMessagesService: AlertMessagesService,
        private alertsService: AlertsService,
        private notificationMessagesService: NotificationMessagesService,
        private dialog: MatDialog,
        private usersService: UsersService,
        private groupService: GroupsService,
        private changeDetectorRef: ChangeDetectorRef,
        private loggingService: LoggingService,
        private themeManager: ThemeManager) { }

    ngOnInit() {
        this.loadData();
        this.subscribeToDarkTheme();
        this.initializeObservables();
    }

    private subscribeToDarkTheme() {
        this.themeManagerSubscription = this.themeManager._darkTheme.subscribe(isDarkTheme => {
            if (isDarkTheme === true) {
                this.isDarkTheme = true;
            } else {
                this.isDarkTheme = false;
            }
        });
    }

    private initializeObservables() {
        this.alertMessages$ = this.alertMessagesService.messages;
        this.alertsCreatedToday$ = this.alertMessagesService.alertsCreatedToday;
        this.alertsCreatedAWeekAgo$ = this.alertMessagesService.alertsCreatedAWeekAgo;
        this.alertsCreatedAMonthAgo$ = this.alertMessagesService.alertsCreatedAMonthAgo;
        this.alertsCreatedMoreThanAMonthAgo$ = this.alertMessagesService.alertsCreatedMoreThanAMonthAgo;
    }

    ngAfterContentChecked() {
        this.changeDetectorRef.detectChanges();
    }

    private loadData() {
        this.notificationMessagesService.startLoadingMessage();
        this.loadingIndicator = true;

        this.currentUser = this.usersService.currentUser;

        forkJoin(
            this.groupService.getGroups(),
            this.usersService.getUsers()
        ).subscribe(
            result => this.onDataLoadSuccessful(result[0], result[1]),
            error => this.onDataLoadFailed(error)
        );
    }

    private onDataLoadSuccessful(groups: Group[], users: User[]) {
        this.notificationMessagesService.stopLoadingMessage();
        this.loadingIndicator = false;
        this.groups = groups;
        this.users = users;

    }

    private onDataLoadFailed(error: any): void {
        this.notificationMessagesService.stopLoadingMessage();
        this.loadingIndicator = false;

        this.notificationMessagesService.showStickyMessage('Load Error', `Unable to retrieve alerts from the server.\r\nErrors: "${Utilities.getHttpResponseMessage(error)}"`,
            MessageSeverity.error, error);
    }

    showCreateDialog(groups: Group[], users: User[]) {
        this.dialog.open(AlertCreateComponent,
            {
                panelClass: 'mat-dialog-md',
                data: { groups: groups, users: users }
            });
    }

    getAlertMessageForRecipient(alertRecipient: AlertRecipient): AlertMessage {
        for (const alert of this.alertMessagesFromServer) {
            if (alert.id === alertRecipient.alertId) {
                return alert;
            }
        }
    }

    parametersAreValid(alertRecipient: AlertRecipient): boolean {
        const isForCurrentUser = alertRecipient.recipientId === this.currentUser.id;
        const isNotMarkedAsDeleted = !alertRecipient.isDeleted;
        const isNotMarkedAsRead = !alertRecipient.isRead;
        const isShownWhenShowDeletedIsSetToTrue = (alertRecipient.isDeleted && this.showDeleted);
        const isShownWhenShowReadIsSetToTrue = (alertRecipient.isRead && this.showRead);

        return (isForCurrentUser) && (isShownWhenShowDeletedIsSetToTrue || isNotMarkedAsDeleted) &&
            (isNotMarkedAsRead || isShownWhenShowReadIsSetToTrue);
    }

    headingShouldBeRendered(alerts: Alert[]): number {
        let count = 0;
        if (alerts) {
            for (const alert of alerts) {
                if (this.parametersAreValid(alert.alertRecipient)) {
                    count++;
                }
            }
        }
        return count;
    }

    toggleWithAnimationOptions() {
        this.withAnimationOptionsVisible = !this.withAnimationOptionsVisible;
    }

    showDeletedClicked() {
        this.showDeleted = this.alertSettings.options.first.selected;
    }

    showReadClicked() {
        this.showRead = this.alertSettings.options.last.selected;
    }

    markAllAsRead() {
        this.loggingService.logUsage('/alerts/markallread');
        this.loggingService.startPerformanceTracker('/alerts/markallread');
        this.alertsService.markAlertsAsRead(this.currentUser.id).subscribe(
            (alertRecipients: AlertRecipient[]) => {
                this.loggingService.stopPerformanceTracker('/alerts/markallread');
                alertRecipients.map((alertRecipient: AlertRecipient) =>
                    this.alertMessagesService.markRead(alertRecipient));
            }

        );
    }

    trackByFn1(item, index) {
        return item.alertId;
    }
    trackByFn2(item, index) {
        return item.alertId;
    }
    trackByFn3(item, index) {
        return item.alertId;
    }
    trackByFn4(item, index) {
        return item.alertId;
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        if (this.themeManagerSubscription) {
            this.themeManagerSubscription.unsubscribe();
        }
    }

}
