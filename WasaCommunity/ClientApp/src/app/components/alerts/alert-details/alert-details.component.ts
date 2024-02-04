import { AlertRecipient } from './../../../models/alert-recipient.model';
import { AlertMessagesService } from './../../../services/alerts/alert-messages.service';
// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component, OnInit, Inject, AfterViewChecked } from '@angular/core';
import { AlertMessage } from 'src/app/models/alert-message.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { LoggingService } from 'src/app/services/general/logging.service';

@Component({
    selector: 'alert-details',
    templateUrl: './alert-details.component.html',
    styleUrls: ['./alert-details.component.scss']
})
export class AlertDetailsComponent implements OnInit {

    constructor(public dialogRef: MatDialogRef<AlertDetailsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { alertMessage: AlertMessage }) { }

    ngOnInit() {
    }

    getAvatarForAlert(alertMessage: AlertMessage): string {
        return require('../../../assets/images/Avatars/' + alertMessage.author.imageUrl);
    }

    closeAlertDetails() {
        this.dialogRef.close();
    }

}
