// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatSort, MatDialog, MatPaginator } from '@angular/material';
import { NotificationMessagesService } from 'src/app/services/notification/notification-messages.service';
import { BackendErrorLog } from 'src/app/models/logging/backend-error-log.model';
import { BackendExceptionDetailsComponent } from '../backend-exception-details/backend-exception-details.component';

@Component({
    selector: 'backend-error-details',
    templateUrl: './backend-error-details.component.html',
    styleUrls: ['./backend-error-details.component.scss']
})
export class BackendErrorDetailsComponent implements OnInit {
    displayedColumns = ['id', 'timestamp', 'location', 'message', 'userId', 'userName', 'hostName', 'customException'];
    dataSource: MatTableDataSource<BackendErrorLog>;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    loadingIndicator: boolean;

    constructor(public dialogRef: MatDialogRef<BackendErrorDetailsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { errors: BackendErrorLog[] },
        private notificationMessagesService: NotificationMessagesService,
        private dialog: MatDialog) { }

    ngOnInit() {
        this.dataSource = new MatTableDataSource(this.data.errors);
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    close() {
        this.dialogRef.close();
    }

    openExceptionDetailsDialog(exception: string) {
        const dialogRef = this.dialog.open(BackendExceptionDetailsComponent,
            {
                panelClass: 'mat-dialog-md',
                data: { exception: exception }
            });
    }

}
