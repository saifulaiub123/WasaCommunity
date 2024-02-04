import { DxChartComponent } from 'devextreme-angular';
import { DashboardService } from './../../../services/dashboard/dashboard.service';
import { Component, OnInit, Input, ViewChild, OnChanges, OnDestroy, HostListener } from '@angular/core';
import { fadeInOut } from 'src/app/shared/animations';
import { ThemeManager } from 'src/app/shared/theme-manager';
import { Observable } from 'rxjs';
import { FrontendErrorsByLocation } from 'src/app/models/logging/frontend-errors-by-location.model';
import { MatDialog } from '@angular/material';
import { FrontendErrorDetailsComponent } from './frontend-error-details/frontend-error-details.component';

@Component({
    selector: 'frontend-errors',
    templateUrl: './frontend-errors.component.html',
    styleUrls: ['./frontend-errors.component.scss'],
    animations: [fadeInOut]
})
export class FrontendErrorsComponent implements OnInit, OnChanges, OnDestroy {
    @Input() errorsByLocation: FrontendErrorsByLocation[];
    @Input() title: string;
    @Input() subtitle: string;

    @ViewChild('chart') chart: DxChartComponent;

    isDarkTheme: boolean;
    color = 'inherit';
    visualRange: { startValue: string; endValue: string; };
    themeManagerSubscription: any;
    redrawChartsSubscription: any;

    constructor(public themeManager: ThemeManager,
                private dialog: MatDialog, private dashboardService: DashboardService) { }

    ngOnInit() {
        this.initializeVariablesBasedOnThemeColor();
    }

    ngAfterViewInit() {
        this.redrawChartsSubscription = this.dashboardService.redrawCharts.subscribe( () => this.chart.instance.render());
    }

    ngOnChanges() {
        if (this.errorsByLocation !== undefined && this.errorsByLocation.length > 5) {
            this.visualRange = {
                startValue: this.errorsByLocation[0].location,
                endValue: this.errorsByLocation[4].location
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
        // const value = Math.round(arg.data.elapsedMilliseconds);
        return {
            visible: true,
            customizeText: function (e: any) {
                const usersAffected = arg.data.amountOfUsersAffected;
                const amountOfErrors = arg.data.amountOfErrors;
                let errors: string;
                let users: string;
                switch (usersAffected) {
                    case 0:
                        users = '';
                        break;
                    case 1:
                        users = usersAffected + ' User';
                        break;
                    default:
                        users = usersAffected + ' Users';
                        break;
                }

                switch (amountOfErrors) {
                    case 0:
                        errors = '';
                        break;
                    case 1:
                        errors = amountOfErrors + ' Error';
                        break;
                    default:
                        errors = amountOfErrors + ' Errors';
                        break;
                }

                return errors + '<br>' + users;
            }
        };
    }

    customizeTooltip(arg: any) {
        return {
            text: arg.seriesName
        };
    }

    openErrorDetailsDialog(event: any) {
        const dialogRef = this.dialog.open(FrontendErrorDetailsComponent,
            {
                panelClass: 'mat-dialog-md-no-padding',
                data: { errors: event.target.data.errors }
            });
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
