import { OnDestroy, HostListener } from '@angular/core';
// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { OrdersByPerson } from 'src/app/models/orders-by-person.model';
import { ThemeManager } from 'src/app/shared/theme-manager';
import { ConfigurationService } from 'src/app/services/general/configuration.service';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { AppTheme } from 'src/app/models/AppTheme';
import { forEach } from '@angular/router/src/utils/collection';
import { Order } from 'src/app/models/order.model';
import { MatDialog } from '@angular/material';
import { OrderDetailsComponent } from '../order-details/order-details.component';
import { CurrencyPipe } from '@angular/common';
import { DxChartComponent } from 'devextreme-angular';

@Component({
  selector: 'ordersbyperson-chart',
  templateUrl: './ordersbyperson-chart.component.html',
  styleUrls: ['./ordersbyperson-chart.component.scss']
})
export class OrdersByPersonChartComponent implements OnInit, OnDestroy {
    @ViewChild('chart') chart: DxChartComponent;
    @Input() chartData: OrdersByPerson[];
    isDarkTheme: boolean;
    color = 'inherit';
    themeManagerSubscription: any;
    redrawChartsSubscription: any;

    constructor(public themeManager: ThemeManager,
                private dialog: MatDialog, private currencyPipe: CurrencyPipe,
                private dashboardService: DashboardService) { }

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

    customizeLabel = (arg: any) => {
        const value = this.currencyPipe.transform(arg.data.totalSumInSek, '', '');
        return {
            visible: true,
            customizeText: function (e: any) {
                return arg.data.amountOfOrders + ' Orders' + '<br>' + value;
            }
        };
    }

    customizeText = (arg: any) => {
        return arg.value + ' SEK';
    }

    openOrderDetailsDialog(event: any) {
        const dialogRef = this.dialog.open(OrderDetailsComponent,
            {
                panelClass: 'mat-dialog-md-no-padding',
                data: { orders: event.target.data.orders, user: event.target.data.user }
            });
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
