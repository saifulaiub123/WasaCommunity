import { AveragePerformanceLog } from 'src/app/models/logging/average-performance-log.model';
import { Component, OnInit, Input, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { fadeInOut } from 'src/app/shared/animations';
import { ThemeManager } from 'src/app/shared/theme-manager';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { DxChartComponent, DxChartModule } from 'devextreme-angular';
import { AveragePerformanceDetailsComponent } from './average-performance-details/average-performance-details.component';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'average-performance',
    templateUrl: './average-performance.component.html',
    styleUrls: ['./average-performance.component.scss'],
    animations: [fadeInOut]
})
export class AveragePerformanceComponent implements OnInit, OnDestroy {
    @Input() performanceLogs: AveragePerformanceLog[];
    @Input() title: string;
    @Input() subtitle: string;

    @ViewChild('chart') chart: DxChartComponent;

    loadingIndicator: boolean;

    isDarkTheme: boolean;
    color = 'inherit';
    visualRange: { startValue: string; endValue: string; };

    redrawChartsSubscription: any;
    themeManagerSubscription: any;

    constructor(public themeManager: ThemeManager,
        private dashboardService: DashboardService, private dialog: MatDialog) { }

    ngOnInit() {
        this.initializeVariablesBasedOnThemeColor();
    }

    ngAfterViewInit() {
        this.redrawChartsSubscription = this.dashboardService.redrawCharts.subscribe( () => this.chart.instance.render());
    }

    ngOnChanges() {
        if (this.performanceLogs !== undefined && this.performanceLogs.length > 4) {
            this.visualRange = {
                startValue: this.performanceLogs[0].message,
                endValue: this.performanceLogs[4].message
             };
        }
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

    customizeLabel = (arg: any) => {
        const value = Math.round(arg.data.averageMilliseconds);
        return {
            visible: true,
            customizeText: function (e: any) {
                return value;
            }
        };
    }

    customizeTooltip(arg: any) {
        return {
            text: arg.argument
        };
    }

    customizeText = (arg: any) => {
        return arg.value;
    }

    openPerformanceDetailsDialog(event: any) {
        const dialogRef = this.dialog.open(AveragePerformanceDetailsComponent,
            {
                panelClass: 'mat-dialog-md-no-padding',
                data: { performanceLogs: event.target.data.performanceLogs }
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
