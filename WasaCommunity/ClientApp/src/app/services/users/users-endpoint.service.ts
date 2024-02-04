// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { EndpointFactory } from '../general/endpoint-factory.service';
import { ConfigurationService } from '../general/configuration.service';
import { AlertRecipient } from 'src/app/models/alert-recipient.model';

@Injectable()
export class UsersEndpoint extends EndpointFactory {

    private readonly _usersUrl: string = '/api/users';
    private readonly _userByUserNameUrl: string = '/api/users/username';
    private readonly _currentUserUrl: string = '/api/users/me';
    private readonly _currentUserPreferencesUrl: string = '/api/users/me/preferences';
    private readonly _unblockUserUrl: string = '/api/users/unblock';
    private readonly _permissionsUrl: string = '/api/permissions';

    get usersUrl() { return this.configurations.baseUrl + this._usersUrl; }
    get userByUserNameUrl() { return this.configurations.baseUrl + this._userByUserNameUrl; }
    get currentUserUrl() { return this.configurations.baseUrl + this._currentUserUrl; }
    get currentUserPreferencesUrl() { return this.configurations.baseUrl + this._currentUserPreferencesUrl; }
    get unblockUserUrl() { return this.configurations.baseUrl + this._unblockUserUrl; }
    get permissionsUrl() { return this.configurations.baseUrl + this._permissionsUrl; }

    constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {

        super(http, configurations, injector);
    }

    getUserEndpoint<T>(userId?: string): Observable<T> {
        const endpointUrl = userId ? `${this.usersUrl}/${userId}` : this.currentUserUrl;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to get user with id: ' + userId, error, () => this.getUserEndpoint(userId));
            }));
    }

    getUserByUserNameEndpoint<T>(userName: string): Observable<T> {
        const endpointUrl = `${this.userByUserNameUrl}/${userName}`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to get user with username: ' + userName, error, () => this.getUserByUserNameEndpoint(userName));
            }));
    }

    getUsersEndpoint<T>(page?: number, pageSize?: number): Observable<T> {
        const endpointUrl = page && pageSize ? `${this.usersUrl}/${page}/${pageSize}` : this.usersUrl;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to get users', error, () => this.getUsersEndpoint(page, pageSize));
            }));
    }

    getNewUserEndpoint<T>(userObject: any): Observable<T> {

        return this.http.post<T>(this.usersUrl, JSON.stringify(userObject), this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to create user with name:' + userObject.fullName , error, () => this.getNewUserEndpoint(userObject));
            }));
    }

    getUpdateUserEndpoint<T>(userObject: any, userId?: string): Observable<T> {
        const endpointUrl = userId ? `${this.usersUrl}/${userId}` : this.currentUserUrl;

        return this.http.put<T>(endpointUrl, JSON.stringify(userObject), this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to update user with name: ' + userObject.fullName, error, () => this.getUpdateUserEndpoint(userObject, userId));
            }));
    }

    getPatchUpdateUserEndpoint<T>(patch: {}, userId?: string): Observable<T>;
    getPatchUpdateUserEndpoint<T>(value: any, op: string, path: string, from?: any, userId?: string): Observable<T>;
    getPatchUpdateUserEndpoint<T>(valueOrPatch: any, opOrUserId?: string, path?: string, from?: any, userId?: string): Observable<T> {
        let endpointUrl: string;
        let patchDocument: {};

        if (path) {
            endpointUrl = userId ? `${this.usersUrl}/${userId}` : this.currentUserUrl;
            patchDocument = from ?
                [{ 'value': valueOrPatch, 'path': path, 'op': opOrUserId, 'from': from }] :
                [{ 'value': valueOrPatch, 'path': path, 'op': opOrUserId }];
        } else {
            endpointUrl = opOrUserId ? `${this.usersUrl}/${opOrUserId}` : this.currentUserUrl;
            patchDocument = valueOrPatch;
        }

        return this.http.patch<T>(endpointUrl, JSON.stringify(patchDocument), this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to partially update user with id: ' + userId , error, () => this.getPatchUpdateUserEndpoint(valueOrPatch, opOrUserId, path, from, userId));
            }));
    }

    getUserPreferencesEndpoint<T>(): Observable<T> {

        return this.http.get<T>(this.currentUserPreferencesUrl, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to get preferences for current user', error, () => this.getUserPreferencesEndpoint());
            }));
    }

    getUpdateUserPreferencesEndpoint<T>(configuration: string): Observable<T> {
        return this.http.put<T>(this.currentUserPreferencesUrl, JSON.stringify(configuration), this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to update preferences for current user', error, () => this.getUpdateUserPreferencesEndpoint(configuration));
            }));
    }

    getUnblockUserEndpoint<T>(userId: string): Observable<T> {
        const endpointUrl = `${this.unblockUserUrl}/${userId}`;

        return this.http.put<T>(endpointUrl, null, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to unblock user with id: ' + userId, error, () => this.getUnblockUserEndpoint(userId));
            }));
    }

    getDeleteUserEndpoint<T>(userId: string): Observable<T> {
        const endpointUrl = `${this.usersUrl}/${userId}`;

        return this.http.delete<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to delete user with id: ' + userId, error, () => this.getDeleteUserEndpoint(userId));
            }));
    }

    getChatMessagesForUserEndpoint<T>(userId: string): Observable<T> {
        const endpointUrl = `${this.usersUrl}/${userId}/chatmessages`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to get chat-messages for user with id: ' + userId, error, () => this.getChatMessagesForUserEndpoint(userId));
            }));
    }

    getMarkChatMessagesForThreadAsReadEndpoint<T>(userId: string): Observable<T> {
        const endpointUrl = `${this.usersUrl}/${userId}/chatmessages/markallread`;

        return this.http.put<T>(endpointUrl, null, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to mark chat-messages as read', error, () => this.getMarkChatMessagesForThreadAsReadEndpoint(userId));
            }));
    }

    getAlertMessagesForUserEndpoint<T>(userId: string): Observable<T> {
        const endpointUrl = `${this.usersUrl}/${userId}/alertmessages`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to get alert-messages for user with id: ' + userId, error, () => this.getAlertMessagesForUserEndpoint(userId));
            }));
    }

    getMarkAlertsAsReadEndpoint<T>(userId: string): Observable<T> {
        const endpointUrl = `${this.usersUrl}/${userId}/alertmessages/markallread`;

        return this.http.put<T>(endpointUrl, null, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to mark alertmessages as read for user with id: ' + userId, error, () => this.getMarkAlertsAsReadEndpoint(userId));
            }));
    }

    getToggleIsReadEndpoint<T>(alertRecipient: AlertRecipient): Observable<T> {
        const endpointUrl = `${this.usersUrl}/${alertRecipient.recipientId}/alertmessages/${alertRecipient.alertId}/toggleread`;

        return this.http.patch<T>(endpointUrl, JSON.stringify(alertRecipient), this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to toggle isRead-status for alert-message to user with id: ' + alertRecipient.recipientId, error, () => this.getToggleIsReadEndpoint(alertRecipient));
            }));
    }

    getMarkAlertRecipientAsDeletedEndpoint<T>(alertRecipient: AlertRecipient): Observable<T> {
        const endpointUrl = `${this.usersUrl}/${alertRecipient.recipientId}/alertmessages/${alertRecipient.alertId}/markdeleted`;

        return this.http.patch<T>(endpointUrl, JSON.stringify(alertRecipient), this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to mark alert-message as deleted', error, () => this.getMarkAlertRecipientAsDeletedEndpoint(alertRecipient));
            }));
    }

    getPermissionsEndpoint<T>(): Observable<T> {

        return this.http.get<T>(this.permissionsUrl, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to get permissions-endpoint', error, () => this.getPermissionsEndpoint());
            }));
    }
}
