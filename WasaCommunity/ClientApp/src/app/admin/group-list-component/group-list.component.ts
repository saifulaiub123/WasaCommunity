import { LoggingService } from './../../services/general/logging.service';
// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild, Input, HostListener } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatSnackBar, MatDialog } from '@angular/material';

import { fadeInOut } from '../../shared/animations';
import { NotificationMessagesService, NotificationMessageDialogType, MessageSeverity } from '../../services/notification/notification-messages.service';
import { AppTranslationService } from '../../services/general/app-translation.service';
import { UsersService } from '../../services/users/users.service';
import { Utilities } from '../../shared/utilities';
import { Role } from '../../models/role.model';
import { Permission } from '../../models/permission.model';
import { EditRoleDialogComponent } from '../edit-role-dialog-component/edit-role-dialog.component';
import { EditGroupDialogComponent } from '../edit-group-dialog-component/edit-group-dialog.component';
import { Group } from 'src/app/models/group.model';
import { User } from 'src/app/models/user.model';
import { GroupsService } from '../../services/group/groups.service';
import { ThemeManager } from 'src/app/shared/theme-manager';

@Component({
    selector: 'group-list',
    templateUrl: './group-list.component.html',
    styleUrls: ['./group-list.component.scss'],
    animations: [fadeInOut]
})
export class GroupListComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns = ['groupName', 'users', 'actions'];
    dataSource: MatTableDataSource<Group>;
    allPermissions: Permission[] = [];
    sourceGroup: Group;
    editingGroupName: { name: string };
    loadingIndicator: boolean;
    users: User[];
    themeManagerSubscription: any;
    isDarkTheme: boolean;

    constructor(
        private notificationMessagesService: NotificationMessagesService,
        private translationService: AppTranslationService,
        private usersService: UsersService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private groupService: GroupsService,
        private loggingService: LoggingService,
        private themeManager: ThemeManager
    ) {
        this.dataSource = new MatTableDataSource();
    }

    get canManageGroups() {
        return this.usersService.userHasPermission(Permission.manageGroupsPermission);
    }

    ngOnInit() {
        this.loadData();
        this.subscribeToDarkTheme();
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
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

    public applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue;
    }

    private refresh() {
        // Causes the filter to refresh there by updating with recently added data.
        this.applyFilter(this.dataSource.filter);
    }

    private updateGroups(group: Group) {
        if (this.sourceGroup) {
            Object.assign(this.sourceGroup, group);
            this.sourceGroup = null;
        } else {
            this.dataSource.data.push(group);
        }

        this.refresh();
    }

    private loadData() {
        this.notificationMessagesService.startLoadingMessage();
        this.loadingIndicator = true;

        this.groupService.getGroupsAndUsers()
            .subscribe(results => {
                this.notificationMessagesService.stopLoadingMessage();
                this.loadingIndicator = false;

                this.dataSource.data = results[0];
                this.users = results[1];
            },
            error => {
                this.notificationMessagesService.stopLoadingMessage();
                this.loadingIndicator = false;

                this.notificationMessagesService.showStickyMessage('Load Error', `Unable to retrieve groups from the server.`, MessageSeverity.error, error);
            });
    }

    private editGroup(group?: Group, users?: User[]) {
        this.sourceGroup = group;

        const dialogRef = this.dialog.open(EditGroupDialogComponent,
            {
                panelClass: 'mat-dialog-md',
                data: { group: group, users: users }
            });
        dialogRef.afterClosed().subscribe(group => {
            if (group && this.canManageGroups) {
                this.updateGroups(group);
            }
        });

    }

    private confirmDelete(group: Group) {
        this.snackBar.open(`Delete ${group.name} group?`, 'DELETE', { duration: 5000 })
            .onAction().subscribe(() => {
                this.loggingService.logUsage('/groups/delete');
                this.loggingService.startPerformanceTracker('/groups/delete');
                this.notificationMessagesService.startLoadingMessage('Deleting...');
                this.loadingIndicator = true;

                this.groupService.deleteGroup(group)
                    .subscribe(results => {
                        this.notificationMessagesService.stopLoadingMessage();
                        this.loadingIndicator = false;
                        this.dataSource.data = this.dataSource.data.filter(item => item !== group);
                        this.loggingService.stopPerformanceTracker('/groups/delete');
                    },
                    error => {
                        this.notificationMessagesService.stopLoadingMessage();
                        this.loadingIndicator = false;

                        this.notificationMessagesService.showStickyMessage('Delete Error', `An error occured when attempting to delete the group.`,
                            MessageSeverity.error, error);
                    });
            });
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        if (this.themeManagerSubscription) {
            this.themeManagerSubscription.unsubscribe();
        }
    }
}
