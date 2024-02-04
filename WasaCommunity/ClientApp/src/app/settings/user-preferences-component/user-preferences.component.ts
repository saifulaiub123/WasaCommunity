// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material';

import { NotificationMessagesService, MessageSeverity } from '../../services/notification/notification-messages.service';
import { ConfigurationService } from '../../services/general/configuration.service';
import { AppTranslationService } from '../../services/general/app-translation.service';
import { UsersService } from '../../services/users/users.service';
import { Utilities } from '../../shared/utilities';
import { PushNotificationService } from 'src/app/services/notification/push-notification.service';
import { SwPush } from '@angular/service-worker';

export interface PageInfo {
    title: string;
    icon: string;
    path: string;
    isDefault: boolean;
}

export interface LanguagePreference {
    name: string;
    locale: string;
    isDefault: boolean;
}

@Component({
    selector: 'user-preferences',
    templateUrl: './user-preferences.component.html',
    styleUrls: ['./user-preferences.component.scss']
})
export class UserPreferencesComponent {
    readonly VAPID_PUBLIC_KEY = 'BMjv_WlLiyxfkq7m3TWPsmvw-SW2R2w4NGOviia7aAKpkjtvVov4kU3KAbvcnKN7dovOtkyNiUqKBE_2zSpOwbo';

    languages: LanguagePreference[] = [
        { name: 'English',    locale: 'en', isDefault: true },
        { name: 'Swedish',    locale: 'se', isDefault: false },
        { name: 'German',     locale: 'de', isDefault: false },
    ];

    homePages: PageInfo[] = [
        { title: 'Dashboard', icon: 'dashboard',              path: '/',         isDefault: true },
        { title: 'People',    icon: 'people',                 path: '/people',   isDefault: false },
        { title: 'Chat',      icon: 'chat',                   path: '/chat',     isDefault: false },
        { title: 'Alerts',    icon: 'notification_important', path: '/alert',    isDefault: false },
        { title: 'About',     icon: 'info',                   path: '/about',    isDefault: false },
        { title: 'Settings',  icon: 'settings',               path: '/settings', isDefault: false },
    ];

    constructor(
        private notificationMessagesService: NotificationMessagesService,
        private translationService: AppTranslationService,
        private usersService: UsersService,
        private snackBar: MatSnackBar,
        public configurations: ConfigurationService,
        private swPush: SwPush,
        private pushNotificationService: PushNotificationService
    ) { }

    get currentHomePage(): PageInfo {
        return this.homePages.find(x => x.path === this.configurations.homeUrl)  || this.homePages[0];
    }

    reload() {
        this.snackBar.open('Reload preferences?', 'RELOAD', { duration: 5000 })
            .onAction().subscribe(() => {
                this.notificationMessagesService.startLoadingMessage();

                this.usersService.getUserPreferences()
                    .subscribe(results => {
                        this.notificationMessagesService.stopLoadingMessage();

                        this.configurations.import(results);

                        this.notificationMessagesService.showMessage('Defaults loaded!', '', MessageSeverity.info);

                    },
                    error => {
                        this.notificationMessagesService.stopLoadingMessage();
                        this.notificationMessagesService.showStickyMessage('Load Error', `Unable to retrieve user preferences from the server.`, MessageSeverity.error, error);
                    });
            });
    }

    save() {
        this.snackBar.open('Save preferences?', 'SAVE', { duration: 5000 })
            .onAction().subscribe(() => {
                this.notificationMessagesService.startLoadingMessage('', 'Saving new defaults');

                if (this.configurations.enablePushNotifications) {
                    this.subscribeToPushNotifications();
                } else {
                    this.unsubscribeToPushNotifications();
                }

                this.usersService.updateUserPreferences(this.configurations.export())
                    .subscribe(response => {
                        this.notificationMessagesService.stopLoadingMessage();
                        this.notificationMessagesService.showMessage('New Defaults', 'Account defaults updated successfully', MessageSeverity.success);

                    },
                    error => {
                        this.notificationMessagesService.stopLoadingMessage();
                        this.notificationMessagesService.showStickyMessage('Save Error',
                        `An error occured while attempting to update your preferences.`, MessageSeverity.error, error);
                    });
            });
    }

    reset() {
        this.snackBar.open('Reset defaults?', 'RESET', { duration: 5000 })
            .onAction().subscribe(() => {
                this.configurations.import(null);
                this.notificationMessagesService.showMessage('Defaults Reset', 'Account defaults reset completed successfully', MessageSeverity.success);
            });
    }

    subscribeToPushNotifications() {
        this.swPush.requestSubscription({
            serverPublicKey: this.VAPID_PUBLIC_KEY
        })
            .then(pushSubscription => {
                this.pushNotificationService.newPushSubscriber(this.usersService.currentUser.id, pushSubscription).subscribe();
            });
    }

    unsubscribeToPushNotifications() {
        this.swPush.unsubscribe();
    }
}
