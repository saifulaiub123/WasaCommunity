// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { ThemeManager } from '../../../shared/theme-manager';
import { Component, OnInit, Input, OnChanges, ViewChild, ChangeDetectorRef } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Invoice } from 'src/app/models/invoice.model';
import { InvoicedAmount } from 'src/app/models/invoiced-amount.model';
import { Observable } from 'rxjs';
import { AppTheme } from 'src/app/models/AppTheme';
import { ConfigurationService } from 'src/app/services/general/configuration.service';
import { CurrencyPipe } from '@angular/common';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { DxChartComponent } from 'devextreme-angular';
import { AfterViewInit } from '@angular/core';
import { OnDestroy, HostListener } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
    selector: 'invoiced-chart',
    templateUrl: './invoiced-chart.component.html',
    styleUrls: ['./invoiced-chart.component.scss']
})
export class InvoicedChartComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
    @ViewChild('chart') chart: DxChartComponent;
    @Input() invoices: Invoice[];
    filteredInvoices: Invoice[];
    chartData: InvoicedAmount[] = [];

    startDate: moment.Moment;
    endDate: moment.Moment;
    dayOne: moment.Moment;
    dayTwo: moment.Moment;
    dayThree: moment.Moment;
    dayFour: moment.Moment;
    dayFive: moment.Moment;

    fjugestaSumDayOne = 0;
    fjugestaSumDayTwo = 0;
    fjugestaSumDayThree = 0;
    fjugestaSumDayFour = 0;
    fjugestaSumDayFive = 0;

    hongkongSumDayOne = 0;
    hongkongSumDayTwo = 0;
    hongkongSumDayThree = 0;
    hongkongSumDayFour = 0;
    hongkongSumDayFive = 0;

    color = 'inherit';

    interval: any;

    isDarkTheme: boolean;

    themeManagerSubscription: any;
    redrawChartsSubscription: any;

    private _mobileQueryListener: () => void;
    mobileQuery: MediaQueryList;


    constructor(public themeManager: ThemeManager, private configuration: ConfigurationService,
        private currencyPipe: CurrencyPipe, private dashboardService: DashboardService,
        changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {

            this.mobileQuery = media.matchMedia('(max-width: 600px)');
            this._mobileQueryListener = () => changeDetectorRef.detectChanges();
            this.mobileQuery.addListener(this._mobileQueryListener);

    }

    ngOnInit() {
        this.initializeVariablesBasedOnThemeColor();
        this.populateDatesWithNewData(this.getMondayOfCurrentWeek());
    }

    private initializeVariablesBasedOnThemeColor() {
        this.themeManagerSubscription = this.themeManager._darkTheme.subscribe(isDarkTheme => {
            if (isDarkTheme === true) {
                this.isDarkTheme = true;
                this.color = '#ffffffc9';
            } else {
                this.isDarkTheme = false;
                this.color = '#616161';
            }
        });
    }

    ngAfterViewInit() {
        this.redrawChartsSubscription = this.dashboardService.redrawCharts.subscribe( () => this.chart.instance.render());
    }

    ngOnChanges() {
        if (this.invoices !== undefined) {
            if (!this.startDate) {
                this.populateDatesWithNewData(this.getMondayOfCurrentWeek());
            }
            this.filterInvoices();
            this.resetChartData();
            this.filterChartData(this.filteredInvoices);
            this.populateChartData();
        }
    }
    resetChartData(): void {
        this.fjugestaSumDayOne = 0;
        this.fjugestaSumDayTwo = 0;
        this.fjugestaSumDayThree = 0;
        this.fjugestaSumDayFour = 0;
        this.fjugestaSumDayFive = 0;

        this.hongkongSumDayOne = 0;
        this.hongkongSumDayTwo = 0;
        this.hongkongSumDayThree = 0;
        this.hongkongSumDayFour = 0;
        this.hongkongSumDayFive = 0;
    }


    private filterChartData(filteredInvoices: Invoice[]) {
        filteredInvoices.forEach(invoice => {
            const invoiceDate = moment(invoice.invoiceDate);
            if (moment(invoiceDate).isSame(this.dayOne, 'day')) {
                if (invoice.warehouse === 'Fjugesta') {
                    this.fjugestaSumDayOne += invoice.amount;
                } else if (invoice.warehouse === 'Hong Kong') {
                    this.hongkongSumDayOne += invoice.amount;
                }
            }
            if (moment(invoiceDate).isSame(this.dayTwo, 'day')) {
                if (invoice.warehouse === 'Fjugesta') {
                    this.fjugestaSumDayTwo += invoice.amount;
                } else if (invoice.warehouse === 'Hong Kong') {
                    this.hongkongSumDayTwo += invoice.amount;
                }
            }
            if (moment(invoiceDate).isSame(this.dayThree, 'day')) {
                if (invoice.warehouse === 'Fjugesta') {
                    this.fjugestaSumDayThree += invoice.amount;
                } else if (invoice.warehouse === 'Hong Kong') {
                    this.hongkongSumDayThree += invoice.amount;
                }
            }
            if (moment(invoiceDate).isSame(this.dayFour, 'day')) {
                if (invoice.warehouse === 'Fjugesta') {
                    this.fjugestaSumDayFour += invoice.amount;
                } else if (invoice.warehouse === 'Hong Kong') {
                    this.hongkongSumDayFour += invoice.amount;
                }
            }
            if (moment(invoiceDate).isSame(this.dayFive, 'day')) {
                if (invoice.warehouse === 'Fjugesta') {
                    this.fjugestaSumDayFive += invoice.amount;
                } else if (invoice.warehouse === 'Hong Kong') {
                    this.hongkongSumDayFive += invoice.amount;
                }
            }
        });
    }

    customizeText = (arg: any) => {
        if (arg.value !== 0) {
            const value = this.currencyPipe.transform(arg.value, '', '');
            return value;
        } else {
            return;
        }

    }

    private populateChartData() {
        this.chartData = [];
        this.chartData.push(new InvoicedAmount(this.dayOne.format('YYYY-MM-DD'), this.hongkongSumDayOne, this.fjugestaSumDayOne));
        this.chartData.push(new InvoicedAmount(this.dayTwo.format('YYYY-MM-DD'), this.hongkongSumDayTwo, this.fjugestaSumDayTwo));
        this.chartData.push(new InvoicedAmount(this.dayThree.format('YYYY-MM-DD'), this.hongkongSumDayThree, this.fjugestaSumDayThree));
        this.chartData.push(new InvoicedAmount(this.dayFour.format('YYYY-MM-DD'), this.hongkongSumDayFour, this.fjugestaSumDayFour));
        this.chartData.push(new InvoicedAmount(this.dayFive.format('YYYY-MM-DD'), this.hongkongSumDayFive, this.fjugestaSumDayFive));
    }

    private getMondayOfCurrentWeek() {
        const d = new Date();
        const day = d.getDay(),
            diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    dateBox_valueChanged(event: any) {
        this.populateDatesWithNewData(event.value);
        this.filterInvoices();
        this.resetChartData();
        this.filterChartData(this.filteredInvoices);
        this.populateChartData();
    }


    private filterInvoices() {
        this.filteredInvoices = [];
        this.invoices.forEach(invoice => {
            const invoiceDate = moment(invoice.invoiceDate);
            if (moment(invoiceDate).isBetween(this.startDate.subtract(1, 'day'), this.endDate.add(1, 'day'), 'day')) {
                this.filteredInvoices.push(invoice);
            }
        });
    }

    private populateDatesWithNewData(date: Date) {
        this.startDate = moment(date, 'YYYY-MM-DD');
        this.endDate = moment(this.startDate, 'YYYY-MM-DD').add(4, 'days');
        this.dayOne = moment(this.startDate);
        this.dayTwo = moment(this.startDate).add(1, 'days');
        this.dayThree = moment(this.startDate).add(2, 'days');
        this.dayFour = moment(this.startDate).add(3, 'days');
        this.dayFive = moment(this.startDate).add(4, 'days');
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        if (this.themeManagerSubscription) {
            this.themeManagerSubscription.unsubscribe();
        }
        if (this.redrawChartsSubscription) {
            this.redrawChartsSubscription.unsubscribe();
        }
        this.mobileQuery.removeListener(this._mobileQueryListener);
    }
}
