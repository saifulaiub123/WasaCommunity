// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { AppTranslationService } from './app-translation.service';
import { LocalStoreManager } from './local-store-manager.service';
import { DBkeys } from '../../shared/db-keys';
import { Utilities } from '../../shared/utilities';
import { environment } from '../../../environments/environment';

interface UserConfiguration {
    language: string;
    homeUrl: string;
    themeId: number;
    showInvoicedChart: boolean;
    showOrderstockChart: boolean;
    showOrdersByPersonChart: boolean;
    enablePushNotifications: boolean;
}

@Injectable()
export class ConfigurationService {
    public static readonly appVersion: string = '1.2.0';

    // ***Specify default configurations here***
    public static readonly defaultLanguage: string = 'en';
    public static readonly defaultHomeUrl: string = '/';
    public static readonly defaultThemeId: number = 1;
    public static readonly defaultShowInvoicedChart: boolean = true;
    public static readonly defaultShowOrderstockChart: boolean = true;
    public static readonly defaultShowOrdersByPersonChart: boolean = true;
    public static readonly defaultEnablePushNotifications: boolean = false;
    // ***End of defaults***

    public baseUrl = environment.baseUrl || Utilities.baseUrl();
    public tokenUrl = environment.tokenUrl || environment.baseUrl || Utilities.baseUrl();
    public loginUrl = environment.loginUrl;
    public fallbackBaseUrl = 'https://community.wasasweden.se';

    private _language: string = null;
    private _homeUrl: string = null;
    private _themeId: number = null;
    private _showInvoicedChart: boolean = null;
    private _showOrderstockChart: boolean = null;
    private _showOrdersByPersonChart: boolean = null;
    private _enablePushNotifications: boolean = null;
    private onConfigurationImported: Subject<boolean> = new Subject<boolean>();

    configurationImported$ = this.onConfigurationImported.asObservable();

    constructor(
        private localStorage: LocalStoreManager,
        private translationService: AppTranslationService,
    ) {
        this.loadLocalChanges();
    }

    private loadLocalChanges() {
        if (this.localStorage.exists(DBkeys.LANGUAGE)) {
            this._language = this.localStorage.getDataObject<string>(DBkeys.LANGUAGE);
            this.translationService.changeLanguage(this._language);
        } else {
            this.resetLanguage();
        }

        if (this.localStorage.exists(DBkeys.HOME_URL)) {
            this._homeUrl = this.localStorage.getDataObject<string>(DBkeys.HOME_URL);
        }

        if (this.localStorage.exists(DBkeys.THEME_ID)) {
            this._themeId = this.localStorage.getDataObject<number>(DBkeys.THEME_ID);
        }

        if (this.localStorage.exists(DBkeys.SHOW_INVOICED_CHART)) {
            this._showInvoicedChart = this.localStorage.getDataObject<boolean>(DBkeys.SHOW_INVOICED_CHART);
        }

        if (this.localStorage.exists(DBkeys.SHOW_ORDERSTOCK_CHART)) {
            this._showOrderstockChart = this.localStorage.getDataObject<boolean>(DBkeys.SHOW_ORDERSTOCK_CHART);
        }

        if (this.localStorage.exists(DBkeys.SHOW_ORDERS_BY_PERSON_CHART)) {
            this._showOrdersByPersonChart = this.localStorage.getDataObject<boolean>(DBkeys.SHOW_ORDERS_BY_PERSON_CHART);
        }

        if (this.localStorage.exists(DBkeys.ENABLE_PUSH_NOTIFICATIONS)) {
            this._enablePushNotifications = this.localStorage.getDataObject<boolean>(DBkeys.ENABLE_PUSH_NOTIFICATIONS);
        }

    }

    private saveToLocalStore(data: any, key: string) {
        setTimeout(() => this.localStorage.savePermanentData(data, key));
    }

    public import(jsonValue: string) {
        this.clearLocalChanges();

        if (jsonValue) {


            const importValue: UserConfiguration = Utilities.JsonTryParse(jsonValue);

            if (importValue.language != null) {
                this.language = importValue.language;
            }

            if (importValue.homeUrl != null) {
                this.homeUrl = importValue.homeUrl;
            }

            if (importValue.themeId != null) {
                this.themeId = importValue.themeId;
            }

            if (importValue.showInvoicedChart != null) {
                this.showInvoicedChart = importValue.showInvoicedChart;
            }

            if (importValue.showOrderstockChart != null) {
                this.showOrderstockChart = importValue.showOrderstockChart;
            }

            if (importValue.showOrdersByPersonChart != null) {
                this.showOrdersByPersonChart = importValue.showOrdersByPersonChart;
            }

            if (importValue.enablePushNotifications != null) {
                this.enablePushNotifications = importValue.enablePushNotifications;
            }
        }

        this.onConfigurationImported.next();
    }

    public export(changesOnly = true): string {
        const exportValue: UserConfiguration = {
            language: changesOnly ? this._language : this.language,
            homeUrl: changesOnly ? this._homeUrl : this.homeUrl,
            themeId: changesOnly ? this._themeId : this.themeId,
            showInvoicedChart: changesOnly ? this._showInvoicedChart : this.showInvoicedChart,
            showOrderstockChart: changesOnly ? this._showOrderstockChart : this.showOrderstockChart,
            showOrdersByPersonChart: changesOnly ? this._showOrdersByPersonChart : this.showOrdersByPersonChart,
            enablePushNotifications: changesOnly ? this._enablePushNotifications : this.enablePushNotifications
        };

        return JSON.stringify(exportValue);
    }

    public clearLocalChanges() {
        this._language = null;
        this._homeUrl = null;
        this._themeId = null;
        this._showInvoicedChart = null;
        this._showOrderstockChart = null;
        this._showOrdersByPersonChart = null;
        this._enablePushNotifications = null;

        this.localStorage.deleteData(DBkeys.LANGUAGE);
        this.localStorage.deleteData(DBkeys.HOME_URL);
        this.localStorage.deleteData(DBkeys.THEME_ID);
        this.localStorage.deleteData(DBkeys.SHOW_INVOICED_CHART);
        this.localStorage.deleteData(DBkeys.SHOW_ORDERSTOCK_CHART);
        this.localStorage.deleteData(DBkeys.SHOW_ORDERS_BY_PERSON_CHART);
        this.localStorage.deleteData(DBkeys.ENABLE_PUSH_NOTIFICATIONS);

        this.resetLanguage();
    }

    private resetLanguage() {
        const language = this.translationService.useBrowserLanguage();

        if (language) {
            this._language = language;
        } else {
            this._language = this.translationService.changeLanguage();
        }
    }

    set language(value: string) {
        this._language = value;
        this.saveToLocalStore(value, DBkeys.LANGUAGE);
        this.translationService.changeLanguage(value);
    }
    get language() {
        return this._language || ConfigurationService.defaultLanguage;
    }

    set homeUrl(value: string) {
        this._homeUrl = value;
        this.saveToLocalStore(value, DBkeys.HOME_URL);
    }
    get homeUrl() {
        return this._homeUrl || ConfigurationService.defaultHomeUrl;
    }

    set themeId(value: number) {
        this._themeId = value;
        this.saveToLocalStore(value, DBkeys.THEME_ID);
    }
    get themeId() {
        return this._themeId || ConfigurationService.defaultThemeId;
    }

    set showInvoicedChart(value: boolean) {
        this._showInvoicedChart = value;
        this.saveToLocalStore(value, DBkeys.SHOW_INVOICED_CHART);
    }

    get showInvoicedChart() {
        return this._showInvoicedChart != null ? this._showInvoicedChart : ConfigurationService.defaultShowInvoicedChart;
    }

    set showOrderstockChart(value: boolean) {
        this._showOrderstockChart = value;
        this.saveToLocalStore(value, DBkeys.SHOW_ORDERSTOCK_CHART);
    }

    get showOrderstockChart() {
        return this._showOrderstockChart != null ? this._showOrderstockChart : ConfigurationService.defaultShowOrderstockChart;
    }

    set showOrdersByPersonChart(value: boolean) {
        this._showOrdersByPersonChart = value;
        this.saveToLocalStore(value, DBkeys.SHOW_ORDERS_BY_PERSON_CHART);
    }

    get showOrdersByPersonChart() {
        return this._showOrdersByPersonChart != null ? this._showOrdersByPersonChart : ConfigurationService.defaultShowOrdersByPersonChart;
    }

    set enablePushNotifications(value: boolean) {
        this._enablePushNotifications = value;
        this.saveToLocalStore(value, DBkeys.ENABLE_PUSH_NOTIFICATIONS);
    }

    get enablePushNotifications() {
        return this._enablePushNotifications != null ? this._enablePushNotifications : ConfigurationService.defaultEnablePushNotifications;
    }
}
