// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatSort, MatDialog, MatPaginator } from '@angular/material';
import { Order } from 'src/app/models/order.model';
import { MinimalUser } from './../../../models/minimal-user.model';

@Component({
    selector: 'order-details',
    templateUrl: './order-details.component.html',
    styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {
    displayedColumns = ['customerNumber', 'customerName', 'orderNumber', 'orderAmount'];
    dataSource: MatTableDataSource<Order>;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    loadingIndicator: boolean;

    constructor(public dialogRef: MatDialogRef<OrderDetailsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { orders: Order[], user: MinimalUser }) {
            this.loadingIndicator = true;
         }

    ngOnInit() {
        this.dataSource = new MatTableDataSource(this.data.orders);
        this.loadingIndicator = false;
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    close() {
        this.dialogRef.close();
    }

    getAvatarForUser(imageUrl: string): string {
        return require('../../../assets/images/Avatars/' + imageUrl);
    }

}
