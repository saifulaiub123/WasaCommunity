// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { OnInit } from '@angular/core';
import { Component, ViewChild } from '@angular/core';

import { LoginControlComponent } from '../login-control/login-control.component';
import { ThemeManager } from 'src/app/shared/theme-manager';
import { Observable } from 'rxjs';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    @ViewChild(LoginControlComponent)
    loginControl: LoginControlComponent;
    logoWhite = require('../../../assets/images/logo_white.svg');
    logoBlack = require('../../../assets/images/logo_black.svg');
    isDarkTheme: Observable<boolean>;

    constructor(private themeManager: ThemeManager) { }

    ngOnInit() {
        this.isDarkTheme = this.themeManager._darkTheme;
    }

    clientUsesInternetExplorer() {
        let browserIsInternetExplorer: boolean;

        const browser = window.navigator.userAgent;
        const internetExplorer = browser.indexOf('MSIE ');

        if (internetExplorer > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
            browserIsInternetExplorer = true;
        } else {
            browserIsInternetExplorer = false;
        }

        return browserIsInternetExplorer;
    }
}
