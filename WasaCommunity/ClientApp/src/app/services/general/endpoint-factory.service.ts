// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { mergeMap, switchMap, catchError } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { ConfigurationService } from './configuration.service';
import { FrontendErrorLog } from 'src/app/models/logging/frontend-error-log.model';

@Injectable()
export class EndpointFactory {
    static readonly apiVersion: string = '1';

    private readonly _loginUrl: string = '/connect/token';
    private readonly _errorUrl: string = '/api/logging/error';

    private get loginUrl() { return this.configurations.tokenUrl + this._loginUrl; }
    protected get errorUrl() { return this.configurations.baseUrl + this._errorUrl; }

    private taskPauser: Subject<any>;
    private isRefreshingLogin: boolean;

    private _authService: AuthService;

    private get authService() {
        if (!this._authService) {
            this._authService = this.injector.get(AuthService);
        }

        return this._authService;
    }

    constructor(protected http: HttpClient, protected configurations: ConfigurationService, private injector: Injector) { }

    getLoginEndpoint<T>(userName: string, password: string): Observable<T> {

        const header = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

        const params = new HttpParams()
            .append('username', userName)
            .append('password', password)
            .append('client_id', 'wasacommunity_spa')
            .append('grant_type', 'password')
            .append('scope', 'openid email phone profile offline_access roles wasacommunity_api');

        return this.http.post<T>(this.loginUrl, params, { headers: header });
    }

    getRefreshLoginEndpoint<T>(): Observable<T> {
        const header = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

        const params = new HttpParams()
            .append('refresh_token', this.authService.refreshToken)
            .append('client_id', 'wasacommunity_spa')
            .append('grant_type', 'refresh_token');

        return this.http.post<T>(this.loginUrl, params, { headers: header }).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to refresh login for user', error, () => this.getRefreshLoginEndpoint());
            }));
    }

    getNewErrorLogEndpoint<T>(errorLog: FrontendErrorLog): Observable<T> {

        return this.http.post<T>(this.errorUrl, JSON.stringify(errorLog), this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to post error log', error, () => this.getNewErrorLogEndpoint(errorLog));
            }));
    }

    protected getRequestHeaders(): { headers: HttpHeaders | { [header: string]: string | string[]; } } {
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + this.authService.accessToken,
            'Content-Type': 'application/json',
            'Accept': `application/vnd.iman.v${EndpointFactory.apiVersion}+json, application/json, text/plain, */*`,
            'App-Version': ConfigurationService.appVersion
        });

        return { headers: headers };
    }

    protected handleError(message: string, error, continuation: () => Observable<any>) {
        this.handleApiError(message, error);
        if (error.status === 401) {
            if (this.isRefreshingLogin) {
                return this.pauseTask(continuation);
            }

            this.isRefreshingLogin = true;

            return this.authService.refreshLogin().pipe(
                mergeMap(data => {
                    this.isRefreshingLogin = false;
                    this.resumeTasks(true);

                    return continuation();
                }),
                catchError(refreshLoginError => {
                    this.isRefreshingLogin = false;
                    this.resumeTasks(false);

                    if (refreshLoginError.status === 401 || (refreshLoginError.url && refreshLoginError.url.toLowerCase().includes(this.loginUrl.toLowerCase()))) {
                        this.authService.reLogin();
                        return throwError('session expired');
                    } else {
                        return throwError(refreshLoginError || 'server error');
                    }
                }));
        }

        if (error.url && error.url.toLowerCase().includes(this.loginUrl.toLowerCase())) {
                this.authService.reLogin();

            return throwError((error.error && error.error.error_description) ? `session expired (${error.error.error_description})` : 'session expired');
        } else {
            return throwError(error);
        }

    }

    private pauseTask(continuation: () => Observable<any>) {
        if (!this.taskPauser) {
            this.taskPauser = new Subject();
        }

        return this.taskPauser.pipe(switchMap(continueOp => {
            return continueOp ? continuation() : throwError('session expired');
        }));
    }

    private resumeTasks(continueOp: boolean) {
        setTimeout(() => {
            if (this.taskPauser) {
                this.taskPauser.next(continueOp);
                this.taskPauser.complete();
                this.taskPauser = null;
            }
        });
    }

    protected handleApiError(message: string, error: any) {
        const errorLog = this.createErrorLog(message, error);
        this.getNewErrorLogEndpoint(errorLog).subscribe();
        throw new Error(error._body ? error._body : message);
    }

    createErrorLog(message: string, error: any): FrontendErrorLog {
        const currentUser = this.authService.currentUser;
        const errorLog = new FrontendErrorLog;
        errorLog.timestamp = new Date();
        errorLog.location = window.location.toString();
        errorLog.layer = 'Frontend';
        errorLog.message = message;
        errorLog.hostName = window.navigator.userAgent;
        errorLog.originalMessage = error.message;

        if (currentUser) {
            errorLog.userId = currentUser.id;
            errorLog.userName = currentUser.userName;
        }

        return errorLog;
    }
}
