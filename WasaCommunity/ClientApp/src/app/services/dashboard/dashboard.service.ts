// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { DashboardEndpoint } from './dashboard-endpoint.service';
import { Invoice } from '../../models/invoice.model';
import { Orderstock } from 'src/app/models/orderstock.model';
import { OrdersByPerson } from 'src/app/models/orders-by-person.model';

@Injectable()
export class DashboardService {

    redrawCharts = new BehaviorSubject('hideSidebar');

    constructor(private dashboardEndpoint: DashboardEndpoint) {
    }

    getInvoices(): Observable<Invoice[]> {
        return this.dashboardEndpoint.getInvoicesEndpoint<Invoice[]>();
    }

    getOrderstock(): Observable<Orderstock[]> {
        return this.dashboardEndpoint.getOrderstockEndpoint<Orderstock[]>();
    }

    getOrdersByPerson(): Observable<OrdersByPerson[]> {
        return this.dashboardEndpoint.getOrdersByPersonEndpoint<OrdersByPerson[]>();
    }

}

