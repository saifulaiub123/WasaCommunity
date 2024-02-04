import { PerformanceLog } from './../../models/logging/performance-log.model';
import { UsageLog } from './../../models/logging/usage-log.model';
import { ConfigurationService } from 'src/app/services/general/configuration.service';
import { Injectable, Injector } from '@angular/core';
import { EndpointFactory } from './endpoint-factory.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DiagnosticLog } from 'src/app/models/logging/diagnostic-log.model';

@Injectable()
export class LoggingEndpointService extends EndpointFactory {

    private readonly _usageUrl: string = '/api/logging/usage';
    private readonly _diagnosticUrl: string = '/api/logging/diagnostic';
    private readonly _performanceUrl: string = '/api/logging/performance';

    get usageUrl() { return this.configurations.baseUrl + this._usageUrl; }
    get diagnosticUrl() { return this.configurations.baseUrl + this._diagnosticUrl; }
    get performanceUrl() { return this.configurations.baseUrl + this._performanceUrl; }

    constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
        super(http, configurations, injector);
    }

    getNewUsageLogEndpoint<T>(usageLog: UsageLog): Observable<T> {

        return this.http.post<T>(this.usageUrl, JSON.stringify(usageLog), this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to create new usage log', error, () => this.getNewUsageLogEndpoint(usageLog));
            }));
    }

    getNewDiagnosticLogEndpoint<T>(diagnosticLog: DiagnosticLog): Observable<T> {

        return this.http.post<T>(this.diagnosticUrl, JSON.stringify(diagnosticLog), this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to create new diagnostic log', error, () => this.getNewDiagnosticLogEndpoint(diagnosticLog));
            }));
    }

    getNewPerformanceLogEndpoint<T>(performanceLog: PerformanceLog): Observable<T> {

        return this.http.post<T>(this.performanceUrl, JSON.stringify(performanceLog), this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to create new performance log', error, () => this.getNewPerformanceLogEndpoint(performanceLog));
            }));
    }

    getMostActiveUsersEndpoint<T>(page?: number, pageSize?: number): Observable<T> {
        const endpointUrl = page && pageSize ? `${this.usageUrl}/mostactiveusers/${page}/${pageSize}` : `${this.usageUrl}/mostactiveusers`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to get most active users', error, () => this.getMostActiveUsersEndpoint(page, pageSize));
            }));
    }

    getMostUsedFeaturesEndpoint<T>(page?: number, pageSize?: number): Observable<T> {
        const endpointUrl = page && pageSize ? `${this.usageUrl}/mostused/${page}/${pageSize}` : `${this.usageUrl}/mostused`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to get most used features', error, () => this.getMostUsedFeaturesEndpoint(page, pageSize));
            }));
    }

    getFrontendErrorsByLocationEndpoint<T>(page?: number, pageSize?: number): Observable<T> {
        const endpointUrl = page && pageSize ? `${this.errorUrl}/frontend/errorsbylocation/${page}/${pageSize}` : `${this.errorUrl}/frontend/errorsbylocation`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to get frontend error logs', error, () => this.getFrontendErrorsByLocationEndpoint(page, pageSize));
            }));
    }

    getBackendErrorsByLocationEndpoint<T>(page?: number, pageSize?: number): Observable<T> {
        const endpointUrl = page && pageSize ? `${this.errorUrl}/backend/errorsbylocation/${page}/${pageSize}` : `${this.errorUrl}/backend/errorsbylocation`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to get backend error logs', error, () => this.getBackendErrorsByLocationEndpoint(page, pageSize));
            }));
    }

    getAveragePerformanceLogsEndpoint<T>(page?: number, pageSize?: number): Observable<T> {
        const endpointUrl = page && pageSize ? `${this.performanceUrl}/average/${page}/${pageSize}` : `${this.performanceUrl}/average`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to get average performance logs', error, () => this.getAveragePerformanceLogsEndpoint(page, pageSize));
            }));
    }

}

