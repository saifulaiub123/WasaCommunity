// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { NotificationMessagesService } from 'src/app/services/notification/notification-messages.service';
import { FrontendErrorLog } from 'src/app/models/logging/frontend-error-log.model';

@Component({
    selector: 'frontend-error-details',
    templateUrl: './frontend-error-details.component.html',
    styleUrls: ['./frontend-error-details.component.scss']
})
export class FrontendErrorDetailsComponent implements OnInit {
    displayedColumns = ['id', 'timestamp', 'location', 'message', 'userId', 'userName', 'hostName', 'originalMessage'];
    dataSource: MatTableDataSource<FrontendErrorLog>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    loadingIndicator: boolean;

    constructor(public dialogRef: MatDialogRef<FrontendErrorDetailsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { errors: FrontendErrorLog[] },
        private notificationMessagesService: NotificationMessagesService) {
         }

    ngOnInit() {
        this.notificationMessagesService.startLoadingMessage();
        this.loadingIndicator = true;
        this.dataSource = new MatTableDataSource(this.data.errors);
        this.loadingIndicator = false;
        this.notificationMessagesService.stopLoadingMessage();
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    close() {
        this.dialogRef.close();
    }

}
