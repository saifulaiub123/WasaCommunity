// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component, ViewChild, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { NotificationMessageDialog, NotificationMessageDialogType, MessageSeverity } from '../../services/notification/notification-messages.service';
import { AppTranslationService } from '../../services/general/app-translation.service';

@Component({
    selector: 'app-dialog',
    templateUrl: 'app-dialog.component.html',
    styleUrls: ['app-dialog.component.scss']
})
export class AppDialogComponent {
    get showTitle() {
        return this.data.title && this.data.title.length;
    }

    get title() {
        return this.data.title;
    }

    get message() {
        return this.data.message;
    }

    get okLabel() {
        return this.data.okLabel || 'OK';
    }

    get cancelLabel() {
        return this.data.cancelLabel || 'CANCEL';
    }

    get showCancel() {
        return this.data.type !== NotificationMessageDialogType.alert;
    }

    get isPrompt() {
        return this.data.type === NotificationMessageDialogType.prompt;
    }

    result: string;

    constructor(
        public dialogRef: MatDialogRef<AppDialogComponent>,
        private translationService: AppTranslationService,
        @Inject(MAT_DIALOG_DATA) private data: NotificationMessageDialog
    ) { }

    ok() {
        if (this.data.type === NotificationMessageDialogType.prompt) {
            this.data.okCallback(this.result || this.data.defaultValue);
        } else {
            this.data.okCallback();
        }
        this.dialogRef.close();
    }

    cancel(): void {
        if (this.data.cancelCallback) {
            this.data.cancelCallback();
        }
        this.dialogRef.close();
    }
}
