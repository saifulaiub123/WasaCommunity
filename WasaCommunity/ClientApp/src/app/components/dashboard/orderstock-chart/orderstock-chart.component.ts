import { OnDestroy, HostListener } from '@angular/core';
// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component, OnInit, Input, SimpleChanges, OnChanges, ViewChild } from '@angular/core';
import { Orderstock } from 'src/app/models/orderstock.model';
import { ThemeManager } from 'src/app/shared/theme-manager';
import { Observable } from 'rxjs';
import { AppTheme } from 'src/app/models/AppTheme';
import { ConfigurationService } from 'src/app/services/general/configuration.service';
import { CurrencyPipe } from '@angular/common';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { DxChartComponent } from 'devextreme-angular';

@Component({
    selector: 'orderstock-chart',
    templateUrl: './orderstock-chart.component.html',
    styleUrls: ['./orderstock-chart.component.scss']
})
export class OrderstockChartComponent implements OnInit, OnChanges, OnDestroy {
    @ViewChild('chart') chart: DxChartComponent;
    @Input() orderstock: Orderstock[];
    isDarkTheme: boolean;
    color = 'inherit';
    totalSumInSek: number;
    amountOfOrders: number;
    themeManagerSubscription: any;
    redrawChartsSubscription: any;

    constructor(public themeManager: ThemeManager,
                private currencyPipe: CurrencyPipe, private dashboardService: DashboardService) { }

    ngOnInit() {
        this.InitializeVariablesBasedOnThemeColor();
    }

    private InitializeVariablesBasedOnThemeColor() {
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
        if (this.orderstock !== undefined) {
            for (const data of this.orderstock) {
                if (data.totalSumInSek !== 0) {
                    this.totalSumInSek = data.totalSumInSek;
                    this.amountOfOrders = data.amountOfOrders;
                }
            }

        }
    }

    customizeLegendText = () => {
        if (this.orderstock) {
            return 'Value: ' + '<strong>' + this.currencyPipe.transform(this.totalSumInSek, '', '') + ' SEK'  + '</strong><br>' +
            'Amount of Orders: ' + '<strong>' + this.amountOfOrders + '</strong>';
        } else {
            return 'Value:<br>Amount of Orders:';
        }

    }

    returnThousand = (arg: any) => {
        return arg.valueText;
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        if (this.themeManagerSubscription) {
            this.themeManagerSubscription.unsubscribe();
        }
        if (this.redrawChartsSubscription) {
            this.redrawChartsSubscription.unsubscribe();
        }
    }
}
