import { OnDestroy, HostListener } from '@angular/core';
// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { ChatThreadsService } from 'src/app/services/chat/chat-threads.service';
import { Component, OnInit } from '@angular/core';
import { fadeInOut } from '../../shared/animations';
import { UsersService } from '../../services/users/users.service';
import { NotificationMessagesService, MessageSeverity } from '../../services/notification/notification-messages.service';
import { Permission } from '../../models/permission.model';
import { Utilities } from '../../shared/utilities';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.model';

import { Observable, interval } from 'rxjs';
import { ThemeManager } from 'src/app/shared/theme-manager';
import { ChatThread } from 'src/app/models/chat-thread.model';
import { MatDialog } from '@angular/material';
import { SchedulerComponent } from '../scheduler/scheduler.component';

@Component({
  selector: 'people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss'],
  animations: [
      fadeInOut
    ]
})
export class PeopleComponent implements OnInit, OnDestroy {

    loadingIndicator: boolean;
    users: User[];
    allRoles: Role[] = [];
    currentUser: User = new User();
    searchTerm: string;
    currentDate: Date = new Date();
    isDarkTheme: boolean;
    count = 0;
    interval: any;
    themeManagerSubscription: any;

    constructor(
    private dialog: MatDialog,
    private notificationMessagesService: NotificationMessagesService,
    private usersService: UsersService,
    private chatThreadsService: ChatThreadsService,
    private themeManager: ThemeManager) {
    }

    ngOnInit() {
        this.loadData();
        this.interval = setInterval(() => {
            this.loadData();
        }, 60000);
        this.subscribeToDarkTheme();
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

    getImageForUser(user: User): string {
        return require('../../assets/images/Avatars/' + user.imageUrl);
    }

    showScheduler(user: User) {
        this.currentUser = user;
        this.dialog.open(SchedulerComponent,
            {
                panelClass: 'mat-dialog-md-no-scroll',
                data: { user: this.currentUser }
            });
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
        this.users = users;
        this.allRoles = roles;
    }

    private onDataLoadFailed(error: any) {
        this.notificationMessagesService.stopLoadingMessage();
        this.loadingIndicator = false;

        this.notificationMessagesService.showStickyMessage('Load Error', `Unable to retrieve users from the server.`, MessageSeverity.error, error);
    }

    isCurrentUser(user: User): boolean {
        if (this.usersService.currentUser.id === user.id) {
            return true;
        } else {
            return false;
        }
    }

    get canViewRoles() {
        return this.usersService.userHasPermission(Permission.viewRolesPermission);
    }

    newMessageThreadForUser(user: User) {
        const thread = new ChatThread(user.email, user.fullName, user.imageUrl);
        this.chatThreadsService.setCurrentThread(thread);
    }

    trackByFunc(item: any) {
        return item.id;
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.themeManagerSubscription) {
            this.themeManagerSubscription.unsubscribe();
        }
    }

}
