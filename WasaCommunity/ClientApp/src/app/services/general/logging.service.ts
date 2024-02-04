import { MostActiveUsers } from './../../models/logging/most-active-users.model';
import { BackendErrorsByLocation } from './../../models/logging/backend-errors-by-location.model';
import { FrontendErrorsByLocation } from './../../models/logging/frontend-errors-by-location.model';
import { PerformanceLog } from './../../models/logging/performance-log.model';
import { UsageLog } from './../../models/logging/usage-log.model';
import { AuthService } from './auth.service';
import { LoggingEndpointService } from './logging-endpoint.service';
import { Injectable } from '@angular/core';
import { DiagnosticLog } from 'src/app/models/logging/diagnostic-log.model';
import { BaseLog } from 'src/app/models/logging/base-log.model';
import { AveragePerformanceLog } from 'src/app/models/logging/average-performance-log.model';
import { FrontendErrorLog } from 'src/app/models/logging/frontend-error-log.model';
import { BackendErrorLog } from 'src/app/models/logging/backend-error-log.model';
import { MostUsedFeatures } from 'src/app/models/logging/most-used-features.model';

@Injectable()
export class LoggingService {

    constructor(private loggingEndpointService: LoggingEndpointService,
        private authService: AuthService) {
    }

    getMostActiveUsers(page?: number, pageSize?: number) {
        return this.loggingEndpointService.getMostActiveUsersEndpoint<MostActiveUsers[]>(page, pageSize);
    }

    getMostUsedFeatures(page?: number, pageSize?: number) {
        return this.loggingEndpointService.getMostUsedFeaturesEndpoint<MostUsedFeatures[]>(page, pageSize);
    }

    getFrontendErrorsByLocation(page?: number, pageSize?: number) {
        return this.loggingEndpointService.getFrontendErrorsByLocationEndpoint<FrontendErrorsByLocation[]>(page, pageSize);
    }

    getBackendErrorsByLocation(page?: number, pageSize?: number) {
        return this.loggingEndpointService.getBackendErrorsByLocationEndpoint<BackendErrorsByLocation[]>(page, pageSize);
    }

    getAveragePerformanceLogs(page?: number, pageSize?: number) {
        return this.loggingEndpointService.getAveragePerformanceLogsEndpoint<AveragePerformanceLog[]>(page, pageSize);
    }

    logUsage(message: string) {
        const usageLog = this.createBaseLog(message) as UsageLog;
        return this.loggingEndpointService.getNewUsageLogEndpoint(usageLog).subscribe();
    }

    logDiagnostic(message: string) {
        const diagnosticLog = this.createBaseLog(message) as DiagnosticLog;
        return this.loggingEndpointService.getNewDiagnosticLogEndpoint(diagnosticLog).subscribe();
    }

    logError(message: string, additionalInfo: any) {
        const logEntry = this.createBaseLog(message) as FrontendErrorLog;
        return this.loggingEndpointService.getNewErrorLogEndpoint(logEntry).subscribe();
    }

    startPerformanceTracker(message: string) {
        const sessionKey = btoa(message);
        sessionStorage[sessionKey] = JSON.stringify(this.createPerformanceLog(message));
    }

    stopPerformanceTracker(message: string) {
        const sessionKey = btoa(message);
        const now = new Date();

        const contents = sessionStorage[sessionKey];
        if (!contents) {
            return;
        }
        const performanceLog = JSON.parse(contents);
        if (performanceLog !== null) {
            performanceLog.elapsedMilliseconds = now.getTime() - Date.parse(performanceLog.timestamp);
            return this.loggingEndpointService.getNewPerformanceLogEndpoint(performanceLog).subscribe();
        }
    }

    private createBaseLog(message: string): BaseLog {
        const currentUser = this.authService.currentUser;
        const baseLog = new BaseLog;
        baseLog.timestamp = new Date();
        baseLog.location = window.location.toString();
        baseLog.layer = 'Frontend';
        baseLog.message = message;
        baseLog.hostName = window.navigator.userAgent;

        if (currentUser) {
            baseLog.userId = currentUser.id;
            baseLog.userName = currentUser.userName;
        }
        return baseLog;
    }

    public createPerformanceLog(message: string): PerformanceLog {
        const currentUser = this.authService.currentUser;
        const performanceLog = new PerformanceLog;
        performanceLog.timestamp = new Date();
        performanceLog.location = window.location.toString();
        performanceLog.layer = 'Frontend';
        performanceLog.message = message;
        performanceLog.hostName = window.navigator.userAgent;

        if (currentUser) {
            performanceLog.userId = currentUser.id;
            performanceLog.userName = currentUser.userName;
        }

        return performanceLog;
    }
}

