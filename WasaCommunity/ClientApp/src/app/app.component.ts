// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { SignalRService } from './services/general/signal-r.service';
import { Component, ChangeDetectorRef, ViewChild, ViewEncapsulation, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { MatExpansionPanel, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastaService, ToastaConfig, ToastOptions, ToastData } from 'ngx-toasta';

import { NotificationMessagesService, NotificationMessageDialog, NotificationMessageDialogType, NotificationMessage, MessageSeverity } from './services/notification/notification-messages.service';
import { NotificationService } from './services/notification/notification.service';
import { AppTranslationService } from './services/general/app-translation.service';
import { UsersService } from './services/users/users.service';
import { LocalStoreManager } from './services/general/local-store-manager.service';
import { AppTitleService } from './services/general/app-title.service';
import { AuthService } from './services/general/auth.service';
import { ConfigurationService } from './services/general/configuration.service';
import { Permission } from './models/permission.model';
import { LoginDialogComponent } from './components/login/login-dialog/login-dialog.component';
import { AppDialogComponent } from './shared/app-dialog-component/app-dialog.component';
import { ThemeManager } from './shared/theme-manager';
import { Observable } from 'rxjs';
import { User } from './models/user.model';
import { LoggingService } from './services/general/logging.service';
import { DashboardService } from './services/dashboard/dashboard.service';
import { SwPush, SwUpdate } from '@angular/service-worker';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    @ViewChild('admin') adminExpander: MatExpansionPanel;

    private _mobileQueryListener: () => void;
    isAppLoaded: boolean;
    isUserLoggedIn: boolean;
    isAdminExpanded: boolean;
    removePrebootScreen: boolean;
    newNotificationCount = 0;
    appTitle = 'Wasa Community';
    blackLogo = require('./assets/images/logo_black.svg');
    whiteLogo = require('./assets/images/logo_white.svg');
    isDarkTheme: Observable<boolean>;

    mobileQuery: MediaQueryList;
    ipadQuery: MediaQueryList;
    stickyToasties: number[] = [];

    dataLoadingConsecutiveFailures = 0;
    notificationsLoadingSubscription: any;

    get notificationsTitle() {

        const gT = (key: string) => this.translationService.getTranslation(key);

        if (this.newNotificationCount) {
            return `${gT('app.Notifications')} (${this.newNotificationCount} ${gT('app.New')})`;
        } else {
            return gT('app.Notifications');
        }
    }

    get currentUser() {
        if (this.usersService.currentUser === null) {
            return new User();
        } else {
            return this.usersService.currentUser;
        }
    }

    constructor(storageManager: LocalStoreManager,
        private swUpdate: SwUpdate,
        private toastaService: ToastaService,
        private toastaConfig: ToastaConfig,
        private usersService: UsersService,
        private notificationMessagesService: NotificationMessagesService,
        private notificationService: NotificationService,
        private appTitleService: AppTitleService,
        private authService: AuthService,
        private translationService: AppTranslationService,
        private themeManager: ThemeManager,
        private signalRService: SignalRService,
        private loggingService: LoggingService,
        public configurations: ConfigurationService,
        public router: Router,
        public dialog: MatDialog,
        public dashboardService: DashboardService,
        changeDetectorRef: ChangeDetectorRef,
        media: MediaMatcher) {
        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this.ipadQuery = media.matchMedia('(max-width: 768px');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);

        storageManager.initialiseStorageSyncListener();

        translationService.addLanguages(['en', 'se', 'de']);
        translationService.setDefaultLanguage('en');

        this.toastaConfig.theme = 'material';
        this.toastaConfig.position = 'top-right';
        this.toastaConfig.limit = 100;
        this.toastaConfig.showClose = true;

        this.appTitleService.appName = this.appTitle;
    }


    ngOnInit() {
        this.isDarkTheme = this.themeManager._darkTheme;
        this.isUserLoggedIn = this.authService.isLoggedIn;

        // 1 sec to ensure all the effort to get the css animation working is appreciated :|, Preboot screen is removed .5 sec later
        setTimeout(() => this.isAppLoaded = true, 1000);
        setTimeout(() => this.removePrebootScreen = true, 1500);

        setTimeout(() => {
            if (this.isUserLoggedIn) {
                this.notificationMessagesService.resetStickyMessage();
                this.notificationMessagesService.showMessage('Login', `Welcome back ${this.userName}!`, MessageSeverity.default);
            }
        }, 2000);

        this.notificationMessagesService.getDialogEvent().subscribe(alert => this.dialog.open(AppDialogComponent,
            {
                data: alert,
                panelClass: 'mat-dialog-sm'
            }));
        this.notificationMessagesService.getMessageEvent().subscribe(message => this.showToast(message, false));
        this.notificationMessagesService.getStickyMessageEvent().subscribe(message => this.showToast(message, true));

        this.authService.reLoginDelegate = () => this.showLoginDialog();

        this.authService.getLoginStatusEvent().subscribe(isLoggedIn => {
            this.isUserLoggedIn = isLoggedIn;


            if (this.isUserLoggedIn) {
                this.initNotificationsLoading();
                this.signalRService.initializeCommunicationHub();
            } else {
                this.unsubscribeNotifications();
            }

            setTimeout(() => {
                if (!this.isUserLoggedIn) {
                    this.notificationMessagesService.showMessage('Session Ended!', '', MessageSeverity.default);
                }
            }, 500);
        });

        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                const url = (<NavigationStart>event).url;

                if (url !== url.toLowerCase()) {
                    this.router.navigateByUrl((<NavigationStart>event).url.toLowerCase());
                }

                if (this.adminExpander && url.indexOf('admin') > 0) {
                    this.adminExpander.open();
                }
            }
        });

        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart && this.isUserLoggedIn) {
                this.loggingService.startPerformanceTracker(event.url);
            }

            if (event instanceof NavigationEnd && this.isUserLoggedIn && !(event.url.toString().endsWith('/login'))) {
                this.loggingService.logUsage(event.urlAfterRedirects);
                this.loggingService.stopPerformanceTracker(event.urlAfterRedirects);
            }
        }
        );

        if (this.swUpdate.isEnabled) {
            this.swUpdate.available.subscribe(() => {
                if (confirm('New version available. Load New Version?')) {
                    window.location.reload();
                }
            });
        }

    }

    ngOnDestroy() {
        this.mobileQuery.removeListener(this._mobileQueryListener);
        this.unsubscribeNotifications();
    }

    private unsubscribeNotifications() {
        if (this.notificationsLoadingSubscription) {
            this.notificationsLoadingSubscription.unsubscribe();
        }
    }

    toggleSidenav(event: any) {
        this.dashboardService.redrawCharts.next('showSidebar');
    }

    initNotificationsLoading() {
        this.notificationsLoadingSubscription = this.notificationService.getNewNotificationsPeriodically()
            .subscribe(notifications => {
                this.dataLoadingConsecutiveFailures = 0;
                this.newNotificationCount = notifications.filter(n => !n.isRead).length;
            },
                error => {
                    this.notificationMessagesService.logError(error);

                    if (this.dataLoadingConsecutiveFailures++ < 20) {
                        setTimeout(() => this.initNotificationsLoading(), 5000);
                    } else {
                        this.notificationMessagesService.showStickyMessage('Load Error', 'Unable to retrieve notifications from the server.', MessageSeverity.error);
                    }
                });
    }

    markNotificationsAsRead() {
        const recentNotifications = this.notificationService.recentNotifications;

        if (recentNotifications.length) {
            this.notificationService.readUnreadNotification(recentNotifications.map(n => n.id), true)
                .subscribe(response => {
                    for (const n of recentNotifications) {
                        n.isRead = true;
                    }

                    this.newNotificationCount = recentNotifications.filter(n => !n.isRead).length;
                },
                    error => {
                        this.notificationMessagesService.logError(error);
                        this.notificationMessagesService.showMessage('Notification Error', 'Marking read notifications failed', MessageSeverity.error);

                    });
        }
    }
    showLoginDialog(): void {
        this.notificationMessagesService.showStickyMessage('Session Expired', 'Your Session has expired. Please log in again', MessageSeverity.info);

        const dialogRef = this.dialog.open(LoginDialogComponent, { minWidth: 600 });

        dialogRef.afterClosed().subscribe(result => {
            this.notificationMessagesService.resetStickyMessage();

            if (!result || this.authService.isSessionExpired) {
                this.authService.logout();
                this.router.navigateByUrl('/login');
                this.notificationMessagesService.showStickyMessage('Session Expired', 'Your Session has expired. Please log in again to renew your session', MessageSeverity.warn);
            }
        });
    }

    showToast(message: NotificationMessage, isSticky: boolean) {
        if (message == null) {
            for (const id of this.stickyToasties.slice(0)) {
                this.toastaService.clear(id);
            }

            return;
        }

        const toastOptions: ToastOptions = {
            title: message.summary,
            msg: message.detail,
            timeout: isSticky ? 0 : 4000
        };

        if (isSticky) {
            toastOptions.onAdd = (toast: ToastData) => this.stickyToasties.push(toast.id);

            toastOptions.onRemove = (toast: ToastData) => {
                const index = this.stickyToasties.indexOf(toast.id, 0);

                if (index > -1) {
                    this.stickyToasties.splice(index, 1);
                }

                toast.onAdd = null;
                toast.onRemove = null;
            };
        }

        switch (message.severity) {
            case MessageSeverity.default: this.toastaService.default(toastOptions); break;
            case MessageSeverity.info: this.toastaService.info(toastOptions); break;
            case MessageSeverity.success: this.toastaService.success(toastOptions); break;
            case MessageSeverity.error: this.toastaService.error(toastOptions); break;
            case MessageSeverity.warn: this.toastaService.warning(toastOptions); break;
            case MessageSeverity.wait: this.toastaService.wait(toastOptions); break;
        }
    }

    clientUsesSafari(): boolean {
        let clientUsesSafari = false;
        clientUsesSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
            navigator.userAgent &&
            navigator.userAgent.indexOf('CriOS') === -1 &&
            navigator.userAgent.indexOf('FxiOS') === -1;
        return clientUsesSafari;
    }

    logout() {
        this.authService.logout();
        this.authService.redirectLogoutUser();
    }

    get userName(): string {
        return this.authService.currentUser ? this.authService.currentUser.userName : '';
    }

    get fullName(): string {
        return this.authService.currentUser ? this.authService.currentUser.fullName : '';
    }

    get canViewPeople() {
        return this.usersService.userHasPermission(Permission.viewUsersPermission);
    }

    get canViewMessages() {
        return this.usersService.userHasPermission(Permission.viewUsersPermission);
    }

    get canViewUsers() {
        return this.usersService.userHasPermission(Permission.viewUsersPermission);
    }

    get canViewRoles() {
        return this.usersService.userHasPermission(Permission.viewRolesPermission);
    }

    get canViewGroups() {
        return this.usersService.userHasPermission(Permission.viewGroupsPermission);
    }

    get canViewApplicationInsights() {
        return this.usersService.userHasPermission(Permission.viewApplicationInsightsPermission);
    }
}
