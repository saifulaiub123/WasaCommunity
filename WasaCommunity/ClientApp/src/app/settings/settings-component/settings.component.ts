// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatExpansionPanel } from '@angular/material';
import { ThemeManager } from './../../shared/theme-manager';
import { UserEditorComponent } from '../../admin/user-editor-component/user-editor.component';
import { UserPreferencesComponent } from '../user-preferences-component/user-preferences.component';
import { Permission } from '../../models/permission.model';
import { Role } from '../../models/role.model';
import { User } from '../../models/user.model';
import { UsersService } from '../../services/users/users.service';
import { NotificationMessagesService, MessageSeverity } from '../../services/notification/notification-messages.service';
import { fadeInOut } from '../../shared/animations';
import { SwPush } from '@angular/service-worker';
import { PushNotificationService } from 'src/app/services/notification/push-notification.service';

@Component({
    selector: 'settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    animations: [fadeInOut]
})
export class SettingsComponent implements OnInit, OnDestroy, AfterViewInit {
    fragmentSubscription: any;

    @ViewChild('profile') profilePanel: MatExpansionPanel;
    @ViewChild('preferences') preferencesPanel: MatExpansionPanel;

    @ViewChild(UserEditorComponent) userProfile: UserEditorComponent;

    @ViewChild(UserPreferencesComponent) userPreferences: UserPreferencesComponent;
    themeManagerSubscription: any;
    isDarkTheme: boolean;

    constructor(
        private notificationMessagesService: NotificationMessagesService,
        private router: Router,
        private route: ActivatedRoute,
        private usersService: UsersService,
        public themeManager: ThemeManager) { }

    ngOnInit() {
        this.fragmentSubscription = this.route.fragment.subscribe(anchor => {
            switch (anchor) {
                case 'preferences':
                    this.preferencesPanel.open();
                    break;
                default:
                    this.profilePanel.open();
            }
        });
        this.subscribeToDarkTheme();
    }

    ngAfterViewInit() {
        this.loadCurrentUserData();

        this.userProfile.userSaved$.subscribe(() => {
            this.notificationMessagesService.showMessage('Success', 'Changes to your User Profile was saved successfully', MessageSeverity.success);
        });
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

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        if (this.fragmentSubscription) {
            this.fragmentSubscription.unsubscribe();
        }
        if (this.themeManagerSubscription) {
            this.themeManagerSubscription.unsubscribe();
        }
    }

    public navigateToFragment(fragment: string) {
        if (fragment) {
            this.router.navigateByUrl(`/settings#${fragment}`);
        }
    }

    private loadCurrentUserData() {
        this.notificationMessagesService.startLoadingMessage();

        if (this.canViewRoles) {
            this.usersService.getUserAndRoles().subscribe(
                results => this.onCurrentUserDataLoadSuccessful(results[0], results[1]),
                error => this.onCurrentUserDataLoadFailed(error)
            );
        } else {
            this.usersService.getUser().subscribe(
                user => this.onCurrentUserDataLoadSuccessful(user, user.roles.map(r => new Role(r))),
                error => this.onCurrentUserDataLoadFailed(error)
            );
        }
    }

    private onCurrentUserDataLoadSuccessful(user: User, roles: Role[]) {
        this.notificationMessagesService.stopLoadingMessage();
        this.userProfile.setUser(user, roles);
    }

    private onCurrentUserDataLoadFailed(error: any) {
        this.notificationMessagesService.stopLoadingMessage();
        this.notificationMessagesService.showStickyMessage('Load Error', `Unable to retrieve user information from the server.`,
            MessageSeverity.error, error);
    }

    get canViewRoles() {
        return this.usersService.userHasPermission(Permission.viewRolesPermission);
    }
}
