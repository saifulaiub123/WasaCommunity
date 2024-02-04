import { MostActiveUsers } from './../../../models/logging/most-active-users.model';
import { Component, OnInit, Input, ViewChild, OnChanges, OnDestroy, HostListener } from '@angular/core';
import { fadeInOut } from 'src/app/shared/animations';
import { ThemeManager } from 'src/app/shared/theme-manager';
import { ConfigurationService } from 'src/app/services/general/configuration.service';
import { AppTheme } from 'src/app/models/AppTheme';
import { Observable } from 'rxjs';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { DxChartComponent } from 'devextreme-angular';

@Component({
    selector: 'active-users',
    templateUrl: './active-users.component.html',
    styleUrls: ['./active-users.component.scss'],
    animations: [fadeInOut]
})
export class ActiveUsersComponent implements OnInit, OnChanges, OnDestroy {
    @Input() mostActiveUsers: MostActiveUsers[];
    @Input() title: string;
    @Input() subtitle: string;

    @ViewChild('chart') chart: DxChartComponent;

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
        if (this.mostActiveUsers !== undefined && this.mostActiveUsers.length > 5) {
            this.visualRange = {
                startValue: this.mostActiveUsers[0].userName,
                endValue: this.mostActiveUsers[4].userName
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

    customizeText = (arg: any) => {
        return arg.value;
    }

    get currentTheme(): AppTheme {
        return this.themeManager.getThemeByID(this.configuration.themeId);
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
