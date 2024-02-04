// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'backend-exception-details',
    templateUrl: './backend-exception-details.component.html',
    styleUrls: ['./backend-exception-details.component.scss']
})
export class BackendExceptionDetailsComponent implements OnInit {
    loadingIndicator: boolean;

    constructor(public dialogRef: MatDialogRef<BackendExceptionDetailsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { exception: string }) { }

    ngOnInit() {
        console.log('data', this.data.exception);
    }

    close() {
        this.dialogRef.close();
    }

}
