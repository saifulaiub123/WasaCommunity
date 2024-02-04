// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Injectable } from '@angular/core';

import { AppTheme } from '../models/AppTheme';
// import { currentTheme, refreshTheme } from 'devextreme/viz/themes';
import { Subject, BehaviorSubject } from 'rxjs';
import DxThemes from 'devextreme/ui/themes';
import { registerPalette } from 'devextreme/viz/palette';

@Injectable()
export class ThemeManager {
    _darkTheme: BehaviorSubject<boolean> = new BehaviorSubject(false);
    _titleFamily = '"Comfortaa", cursive';
    _bodyFamily = '"Open Sans", sans-serif';

    themes: Array<AppTheme> = [
        {
            id: 1,
            name: 'Light Blue',
            primary: '#00bcd4',
            accent: '#006064',
            href: 'blue-light',
            isDark: false,
            isDefault: true,
        },
        {
            id: 2,
            name: 'Dark Orange',
            primary: '#F57C00',
            accent: '#1976D2',
            href: 'orange-dark',
            isDark: true,
        }
    ];

    public installTheme(theme: AppTheme) {

        const lightPalette = {
            simpleSet: ['#26c6da', '#c5e1a5', '#b2ebf2', '#a5d6a7', '#64b5f6', '#80cbc4'],
        };

        const darkPalette = {
            simpleSet: ['#f57c00', '#689f38', '#f9a825', '#757575', '#c0ca33', '#ff6f00'],
        };
        registerPalette('lightPalette', lightPalette);
        registerPalette('darkPalette', darkPalette);
        DxThemes.current(theme.href);
        this._darkTheme.next(theme.isDark);
        if (theme == null || theme.isDefault) {
            this.removeStyle('theme');
        } else {
            this.setStyle('theme', `assets/themes/${theme.href}.css`);
        }
    }

    public getThemeByID(id: number): AppTheme {
        return this.themes.find(theme => theme.id === id);
    }

    private setStyle(key: string, href: string) {
        this.getLinkElementForKey(key).setAttribute('href', href);
    }

    private removeStyle(key: string) {
        const existingLinkElement = this.getExistingLinkElementByKey(key);
        if (existingLinkElement) {
            document.head.removeChild(existingLinkElement);
        }
    }

    private getLinkElementForKey(key: string) {
        return this.getExistingLinkElementByKey(key) || this.createLinkElementWithKey(key);
    }

    private getExistingLinkElementByKey(key: string) {
        return document.head.querySelector(`link[rel="stylesheet"].${this.getClassNameForKey(key)}`);
    }

    private createLinkElementWithKey(key: string) {
        const linkEl = document.createElement('link');
        linkEl.setAttribute('rel', 'stylesheet');
        linkEl.classList.add(this.getClassNameForKey(key));
        document.head.appendChild(linkEl);
        return linkEl;
    }

    private getClassNameForKey(key: string) {
        return `style-manager-${key}`;
    }
}
