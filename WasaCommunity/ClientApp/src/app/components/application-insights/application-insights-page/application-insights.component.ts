import { MostUsedFeatures } from 'src/app/models/logging/most-used-features.model';
import { BackendErrorLog as BackendErrorsByLocation } from './../../../models/logging/backend-error-log.model';
import { FrontendErrorLog as FrontendErrorsByLocation } from 'src/app/models/logging/frontend-error-log.model';
import { UsageLog as MostActiveUsers } from '../../../models/logging/usage-log.model';
import { NotificationMessagesService, MessageSeverity } from '../../../services/notification/notification-messages.service';
import { LoggingService } from '../../../services/general/logging.service';
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Utilities } from 'src/app/shared/utilities';
import { AveragePerformanceLog } from 'src/app/models/logging/average-performance-log.model';
import { fadeInOut } from 'src/app/shared/animations';

@Component({
    selector: 'application-insights',
    templateUrl: './application-insights.component.html',
    styleUrls: ['./application-insights.component.scss'],
    animations: [fadeInOut]
})

export class ApplicationInsightsComponent implements OnInit {
    loadingIndicator: boolean;

    mostActiveUsers: MostActiveUsers[];
    averagePerformanceLogs: AveragePerformanceLog[];
    backendErrorsByLocation: BackendErrorsByLocation[];
    frontendErrorsByLocation: FrontendErrorsByLocation[];
    mostUsedFeatures: MostUsedFeatures[];

    constructor(private loggingService: LoggingService,
                private notificationMessagesService: NotificationMessagesService) {}

    ngOnInit() {
        this.loadData();
    }

    private loadData() {
        this.notificationMessagesService.startLoadingMessage();
        this.loadingIndicator = true;

        forkJoin(
            this.loggingService.getMostActiveUsers(1, 50),
            this.loggingService.getFrontendErrorsByLocation(1, 50),
            this.loggingService.getBackendErrorsByLocation(1, 50),
            this.loggingService.getAveragePerformanceLogs(1, 50),
            this.loggingService.getMostUsedFeatures(1, 50)
        ).subscribe(
            result => this.onDataLoadSuccessful(result[0], result[1], result[2], result[3], result[4]),
            error => this.onDataLoadFailed(error)
        );
    }

    private onDataLoadSuccessful(mostActiveUsers: MostActiveUsers[], frontendErrorsByLocation: FrontendErrorsByLocation[],
                                backendErrorsByLocation: BackendErrorsByLocation[], averagePerformanceLogs: AveragePerformanceLog[],
                                mostUsedFeatures: MostUsedFeatures[]) {
        this.notificationMessagesService.stopLoadingMessage();
        this.loadingIndicator = false;
        this.mostActiveUsers = mostActiveUsers;
        this.frontendErrorsByLocation = frontendErrorsByLocation;
        this.backendErrorsByLocation = backendErrorsByLocation;
        this.averagePerformanceLogs = averagePerformanceLogs;
        this.mostUsedFeatures = mostUsedFeatures;
    }

    private onDataLoadFailed(error: any) {
        this.notificationMessagesService.stopLoadingMessage();
        this.loadingIndicator = false;

        this.notificationMessagesService.showStickyMessage('Load Error', `Unable to retrieve logs from the server.`, MessageSeverity.error, error);
    }
}
