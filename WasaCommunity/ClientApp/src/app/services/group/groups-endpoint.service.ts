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

@Injectable()
export class GroupsEndpoint extends EndpointFactory {
    private readonly _groupsUrl: string = '/api/groups';
    private readonly _groupsByGroupNameUrl: string = '/api/groups/name';

    get groupsUrl() { return this.configurations.baseUrl + this._groupsUrl; }
    get groupsByGroupNameUrl() { return this.configurations.baseUrl + this._groupsByGroupNameUrl; }

    constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {

        super(http, configurations, injector);
    }

    getGroupsEndpoint<T>(page?: number, pageSize?: number): Observable<T> {
        const endpointUrl = page && pageSize ? `${this.groupsUrl}/${page}/${pageSize}` : this.groupsUrl;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to get groups', error, () => this.getGroupsEndpoint(page, pageSize));
            }));
    }

    getGroupByGroupNameEndpoint<T>(groupName: string): Observable<T> {
        const endpointUrl = `${this.groupsByGroupNameUrl}/${groupName}`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to get group with name: ' + groupName, error, () => this.getGroupByGroupNameEndpoint(groupName));
            }));
    }

    getNewGroupEndpoint<T>(groupObject: any): Observable<T> {

        return this.http.post<T>(this.groupsUrl, JSON.stringify(groupObject), this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to create new group with name: ' + groupObject.name, error, () => this.getNewGroupEndpoint(groupObject));
            }));
    }

    getUpdateGroupEndpoint<T>(groupObject: any, groupId: string): Observable<T> {
        const endpointUrl = `${this.groupsUrl}/${groupId}`;

        return this.http.put<T>(endpointUrl, JSON.stringify(groupObject), this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to update group with name: ' + groupObject.name, error, () => this.getUpdateGroupEndpoint(groupObject, groupId));
            }));
    }

    getDeleteGroupEndpoint<T>(groupId: string): Observable<T> {
        const endpointUrl = `${this.groupsUrl}/${groupId}`;

        return this.http.delete<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to delete group with id: ' + groupId, error, () => this.getDeleteGroupEndpoint(groupId));
            }));
    }

    getMembersForGroupEndpoint<T>(groupId: string): Observable<T> {
        const endpointUrl = `${this.groupsUrl}/${groupId}/members`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to get members for group with id: ' + groupId, error, () => this.getMembersForGroupEndpoint(groupId));
            }));
    }
}
