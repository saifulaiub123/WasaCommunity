import { DxChartComponent } from 'devextreme-angular';
import { MostUsedFeatures } from './../../../models/logging/most-used-features.model';
import { Component, OnInit, Input, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { fadeInOut } from 'src/app/shared/animations';
import { ThemeManager } from 'src/app/shared/theme-manager';
import { ConfigurationService } from 'src/app/services/general/configuration.service';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';

@Component({
    selector: 'most-used-features',
    templateUrl: './most-used-features.component.html',
    styleUrls: ['./most-used-features.component.scss'],
    animations: [fadeInOut]
})
export class MostUsedFeaturesComponent implements OnInit, OnDestroy {
    @Input() mostUsedFeatures: MostUsedFeatures[];
    @Input() title: string;
    @Input() subtitle: string;

    @ViewChild('chart') chart: DxChartComponent;

    loadingIndicator: boolean;

    isDarkTheme: boolean;
    color = 'inherit';
    visualRange: { startValue: string; endValue: string; };
    themeManagerSubscription: any;
    redrawChartsSubscription: any;

    constructor(public themeManager: ThemeManager, private configuration: ConfigurationService,
                private dashboardService: DashboardService) { }

    ngOnInit() {
        this.initializeVariablesBasedOnThemeColor();
    }

    ngAfterViewInit() {
        this.redrawChartsSubscription = this.dashboardService.redrawCharts.subscribe( () => this.chart.instance.render());
    }

    ngOnChanges() {
        if (this.mostUsedFeatures !== undefined && this.mostUsedFeatures.length > 5) {
            this.visualRange = {
                startValue: this.mostUsedFeatures[0].location,
                endValue: this.mostUsedFeatures[4].location
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
        return {
            visible: true,
            customizeText: function (e: any) {
                return arg.data.amountOfUsageLogsGenerated;
            }
        };
    }

    customizeTooltip(arg: any) {
        return {
            text: arg.seriesName
        };
    }

    customizeText = (arg: any) => {
        return arg.value;
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
