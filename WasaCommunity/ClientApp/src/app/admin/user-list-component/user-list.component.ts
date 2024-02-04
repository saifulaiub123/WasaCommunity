import { LoggingService } from './../../services/general/logging.service';
import { Appointment } from './../../models/appointment.model';
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
import { User } from '../../models/user.model';
import { Role } from '../../models/role.model';
import { Permission } from '../../models/permission.model';
import { EditUserDialogComponent } from '../edit-user-dialog-component/edit-user-dialog.component';
import { ThemeManager } from 'src/app/shared/theme-manager';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss'],
    animations: [fadeInOut]
})
export class UserListComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns = ['jobTitle', 'userName', 'fullName', 'email'];
    dataSource: MatTableDataSource<User>;
    sourceUser: User;
    loadingIndicator: boolean;
    allRoles: Role[] = [];
    themeManagerSubscription: any;
    isDarkTheme: boolean;

    constructor(
        private notificationMessagesService: NotificationMessagesService,
        private usersService: UsersService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private loggingService: LoggingService,
        private themeManager: ThemeManager) {


        if (this.canManageUsers) {
            this.displayedColumns.push('actions');
        }

        // Assign the data to the data source for the table to render
        this.dataSource = new MatTableDataSource();
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
        this.applyFilter(this.dataSource.filter);
    }

    private updateUsers(user: User) {
        if (this.sourceUser) {
            Object.assign(this.sourceUser, user);
            this.notificationMessagesService.showMessage('Success', `Changes to user \"${user.userName}\" was saved successfully`, MessageSeverity.success);
            this.sourceUser = null;
        } else {
            this.dataSource.data.push(user);
            this.refresh();
            this.notificationMessagesService.showMessage('Success', `User \"${user.userName}\" was created successfully`, MessageSeverity.success);
        }
    }

    private loadData() {
        this.notificationMessagesService.startLoadingMessage();
        this.loadingIndicator = true;

        if (this.canViewRoles) {
            this.usersService.getUsersAndRoles().subscribe(
                results => this.onDataLoadSuccessful(results[0], results[1]),
                error => this.onDataLoadFailed(error)
            );
        } else {
            this.usersService.getUsers().subscribe(
                users => this.onDataLoadSuccessful(users, this.usersService.currentUser.roles.map(r => new Role(r))),
                error => this.onDataLoadFailed(error)
            );
        }
    }

    private onDataLoadSuccessful(users: User[], roles: Role[]) {
        this.notificationMessagesService.stopLoadingMessage();
        this.loadingIndicator = false;
        this.dataSource.data = users;
        this.allRoles = roles;
    }

    private onDataLoadFailed(error: any) {
        this.notificationMessagesService.stopLoadingMessage();
        this.loadingIndicator = false;

        this.notificationMessagesService.showStickyMessage('Load Error', `Unable to retrieve users from the server.`, MessageSeverity.error, error);
    }

    private editUser(user?: User) {
        this.sourceUser = user;

        const dialogRef = this.dialog.open(EditUserDialogComponent,
            {
                panelClass: 'mat-dialog-lg',
                data: { user: user, roles: [...this.allRoles] }
            });
        dialogRef.afterClosed().subscribe(user => {
            if (user) {
                this.updateUsers(user);
            }
        });
    }

    private confirmDelete(user: User) {
        this.snackBar.open(`Delete ${user.userName}?`, 'DELETE', { duration: 5000 })
            .onAction().subscribe(() => {
                this.loggingService.logUsage('/users/delete');
                this.loggingService.startPerformanceTracker('/users/delete');
                this.notificationMessagesService.startLoadingMessage('Deleting...');
                this.loadingIndicator = true;

                this.usersService.deleteUser(user)
                    .subscribe(results => {
                        this.notificationMessagesService.stopLoadingMessage();
                        this.loadingIndicator = false;
                        this.dataSource.data = this.dataSource.data.filter(item => item !== user);
                        this.loggingService.stopPerformanceTracker('/users/delete');
                    },
                    error => {
                        this.notificationMessagesService.stopLoadingMessage();
                        this.loadingIndicator = false;

                        this.notificationMessagesService.showStickyMessage('Delete Error', `An error occured while attempting to delete the user.`, MessageSeverity.error, error);
                    });
            });
    }

    get canManageUsers() {
        return this.usersService.userHasPermission(Permission.manageUsersPermission);
    }

    get canViewRoles() {
        return this.usersService.userHasPermission(Permission.viewRolesPermission);
    }

    get canAssignRoles() {
        return this.usersService.userHasPermission(Permission.assignRolesPermission);
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        if (this.themeManagerSubscription) {
            this.themeManagerSubscription.unsubscribe();
        }
    }
}
