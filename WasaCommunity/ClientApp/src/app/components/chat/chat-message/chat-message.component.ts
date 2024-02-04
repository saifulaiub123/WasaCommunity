import { OnDestroy, HostListener } from '@angular/core';
// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { UsersService } from '../../../services/users/users.service';
import { Component, OnInit, Input } from '@angular/core';
import { ChatMessage } from 'src/app/models/chat-message.model';
import { User } from 'src/app/models/user.model';
import { ThemeManager } from 'src/app/shared/theme-manager';


@Component({
    selector: 'chat-message',
    templateUrl: './chat-message.component.html',
    styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit, OnDestroy {
    @Input() message: ChatMessage;
    currentUser: User;
    incoming: boolean;
    themeManagerSubscription: any;
    isDarkTheme: boolean;
    incomingColor: string;
    outgoingColor: string;

    constructor(public usersService: UsersService, private themeManager: ThemeManager) {
    }

    ngOnInit(): void {
        this.currentUser = this.usersService.currentUser;
        if (this.message.author.id !== this.currentUser.id) {
            this.incoming = true;
        } else {
            this.incoming = false;
        }
        this.initializeVariablesBasedOnThemeColor();
    }

    private initializeVariablesBasedOnThemeColor() {
        this.themeManagerSubscription = this.themeManager._darkTheme.subscribe(isDarkTheme => {
            if (isDarkTheme === true) {
                this.isDarkTheme = true;
                this.incomingColor = 'rgba(230, 74, 25, 0.8)';
                this.outgoingColor = '#ff7043';
            } else {
                this.isDarkTheme = false;
                this.incomingColor = '#26c6da';
                this.outgoingColor = '#b2ebf2';
            }
        });
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        if (this.themeManagerSubscription) {
            this.themeManagerSubscription.unsubscribe();
        }
    }
}
