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
export class DashboardEndpoint extends EndpointFactory {
    private readonly _invoicesUrl: string = '/api/dashboard/invoices';
    private readonly _orderstockUrl: string = '/api/dashboard/orderstock';
    private readonly _ordersbypersonUrl: string = '/api/dashboard/ordersbyperson';

    get invoicesUrl() { return this.configurations.baseUrl + this._invoicesUrl; }
    get orderstockUrl() { return this.configurations.baseUrl + this._orderstockUrl; }
    get ordersbypersonUrl() { return this.configurations.baseUrl + this._ordersbypersonUrl; }

    constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {

        super(http, configurations, injector);
    }

    getInvoicesEndpoint<T>(): Observable<T> {
        const endpointUrl = `${this.invoicesUrl}`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to get invoices', error, () => this.getInvoicesEndpoint());
            }));
    }

    getOrderstockEndpoint<T>(): Observable<T> {
        const endpointUrl = `${this.orderstockUrl}`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to get orderstock-data', error, () => this.getOrderstockEndpoint());
            }));
    }

    getOrdersByPersonEndpoint<T>(): Observable<T> {
        const endpointUrl = `${this.ordersbypersonUrl}`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe<T>(
            catchError(error => {
                return this.handleError('Unable to get orders-by-person-data', error, () => this.getOrdersByPersonEndpoint());
            }));
    }

}
