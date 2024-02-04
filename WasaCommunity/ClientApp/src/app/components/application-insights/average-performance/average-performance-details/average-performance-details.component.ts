// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatSort, MatDialog, MatPaginator } from '@angular/material';
import { PerformanceLog } from 'src/app/models/logging/performance-log.model';

@Component({
    selector: 'average-performance-details',
    templateUrl: './average-performance-details.component.html',
    styleUrls: ['./average-performance-details.component.scss']
})
export class AveragePerformanceDetailsComponent implements OnInit {
    displayedColumns = ['id', 'timestamp', 'message', 'userId', 'userName', 'hostName', 'elapsedMilliseconds'];
    dataSource: MatTableDataSource<PerformanceLog>;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    loadingIndicator: boolean;

    constructor(public dialogRef: MatDialogRef<AveragePerformanceDetailsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { performanceLogs: PerformanceLog[] }) { }

    ngOnInit() {
        this.dataSource = new MatTableDataSource(this.data.performanceLogs);
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    close() {
        this.dialogRef.close();
    }

}
