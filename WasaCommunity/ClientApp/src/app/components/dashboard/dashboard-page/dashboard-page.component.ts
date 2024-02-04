import { OnDestroy, HostListener } from '@angular/core';
// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { NotificationMessagesService, MessageSeverity } from '../../../services/notification/notification-messages.service';
import { Component, OnInit } from '@angular/core';
import { fadeInOut } from '../../../shared/animations';
import { ConfigurationService } from '../../../services/general/configuration.service';
import { Invoice } from 'src/app/models/invoice.model';
import { Utilities } from 'src/app/shared/utilities';
import { forkJoin } from 'rxjs';
import { OrdersByPerson } from 'src/app/models/orders-by-person.model';
import { Orderstock } from 'src/app/models/orderstock.model';

@Component({
    selector: 'dashboard-page',
    templateUrl: './dashboard-page.component.html',
    styleUrls: ['./dashboard-page.component.scss'],
    animations: [fadeInOut]
})
export class DashboardPageComponent implements OnInit, OnDestroy {
    loadingIndicator: boolean;

    invoices: Invoice[];
    orderstock: Orderstock[];
    ordersByPersons: OrdersByPerson[];

    interval: any;


    constructor(public configurations: ConfigurationService, private notificationMessagesService: NotificationMessagesService,
                private dashboardService: DashboardService) {

    }

    ngOnInit() {
        this.loadingIndicator = true;
        this.loadData();
        this.interval = setInterval(() => {
            this.loadData();
        }, 300000);
    }

    private loadData() {
        this.notificationMessagesService.startLoadingMessage();

        forkJoin(
            this.dashboardService.getInvoices(),
            this.dashboardService.getOrderstock(),
            this.dashboardService.getOrdersByPerson()
        )
        .subscribe(
            results => this.onDataLoadSuccessful(results[0], results[1], results[2]),
            error => this.onDataLoadFailed(error)
        );
    }

    private onDataLoadSuccessful(invoices: Invoice[], orderstock: Orderstock[], ordersByPersons: OrdersByPerson[]) {
        this.invoices = invoices;
        this.orderstock = orderstock;
        this.ordersByPersons = ordersByPersons;
        this.notificationMessagesService.stopLoadingMessage();
        this.loadingIndicator = false;
    }

    private onDataLoadFailed(error: any) {
        this.notificationMessagesService.stopLoadingMessage();
        this.loadingIndicator = false;

        this.notificationMessagesService.showStickyMessage('Load Error', `Unable to retrieve data from the server.`, MessageSeverity.error, error);
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}
