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
import { RolesService } from 'src/app/services/roles/roles.service';
import { ThemeManager } from 'src/app/shared/theme-manager';

@Component({
    selector: 'app-role-list',
    templateUrl: './role-list.component.html',
    styleUrls: ['./role-list.component.scss'],
    animations: [fadeInOut]
})
export class RoleListComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns = ['roleName', 'description', 'users', 'actions'];
    dataSource: MatTableDataSource<Role>;
    allPermissions: Permission[] = [];
    sourceRole: Role;
    editingRoleName: { name: string };
    loadingIndicator: boolean;
    themeManagerSubscription: any;
    isDarkTheme: boolean;

    constructor(
        private notificationMessagesService: NotificationMessagesService,
        private translationService: AppTranslationService,
        private rolesService: RolesService,
        private usersService: UsersService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog, private loggingService: LoggingService,
        private themeManager: ThemeManager
    ) {
        this.dataSource = new MatTableDataSource();
    }

    get canManageRoles() {
        return this.usersService.userHasPermission(Permission.manageRolesPermission);
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

    private updateRoles(role: Role) {
        if (this.sourceRole) {
            Object.assign(this.sourceRole, role);
            this.sourceRole = null;
        } else {
            this.dataSource.data.push(role);
        }

        this.refresh();
    }

    private loadData() {
        this.notificationMessagesService.startLoadingMessage();
        this.loadingIndicator = true;

        this.rolesService.getRolesAndPermissions()
            .subscribe(results => {
                this.notificationMessagesService.stopLoadingMessage();
                this.loadingIndicator = false;

                this.dataSource.data = results[0];
                this.allPermissions = results[1];
            },
            error => {
                this.notificationMessagesService.stopLoadingMessage();
                this.loadingIndicator = false;

                this.notificationMessagesService.showStickyMessage('Load Error', `Unable to retrieve roles from the server.`, MessageSeverity.error, error);
            });
    }

    private editRole(role?: Role) {
        this.sourceRole = role;

        const dialogRef = this.dialog.open(EditRoleDialogComponent,
            {
                panelClass: 'mat-dialog-md',
                data: { role: role, allPermissions: this.allPermissions }
            });
        dialogRef.afterClosed().subscribe(role => {
            if (role && this.canManageRoles) {
                this.updateRoles(role);
            }
        });
    }

    private confirmDelete(role: Role) {
        this.snackBar.open(`Delete ${role.name} role?`, 'DELETE', { duration: 5000 })
            .onAction().subscribe(() => {
                this.loggingService.logUsage('/roles/delete');
                this.loggingService.startPerformanceTracker('roles/delete');
                this.notificationMessagesService.startLoadingMessage('Deleting...');
                this.loadingIndicator = true;

                this.rolesService.deleteRole(role)
                    .subscribe(results => {
                        this.notificationMessagesService.stopLoadingMessage();
                        this.loadingIndicator = false;
                        this.dataSource.data = this.dataSource.data.filter(item => item !== role);
                        this.loggingService.stopPerformanceTracker('roles/delete');
                    },
                    error => {
                        this.notificationMessagesService.stopLoadingMessage();
                        this.loadingIndicator = false;

                        this.notificationMessagesService.showStickyMessage('Delete Error', `An error occured while attempting to delete the role.`, MessageSeverity.error, error);
                        this.notificationMessagesService.showStickyMessage('Error Details', `Please make sure that the role does not contain any users`, MessageSeverity.error, error);
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
