// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Injectable } from '@angular/core';
import { HttpResponseBase } from '@angular/common/http';
import { Observable ,  Subject } from 'rxjs';

import { AppTranslationService } from '../general/app-translation.service';
import { Utilities } from '../../shared/utilities';

@Injectable()
export class NotificationMessagesService {
    private messages = new Subject<NotificationMessage>();
    private stickyMessages = new Subject<NotificationMessage>();
    private dialogs = new Subject<NotificationMessageDialog>();

    private _isLoading = false;
    private loadingMessageId: any;

    constructor(private translationService: AppTranslationService) { }

    showDialog(title: string, message: string);
    showDialog(title: string, message: string, type: NotificationMessageDialogType, okCallback: (val?: any) => any);
    showDialog(title: string, message: string, type: NotificationMessageDialogType, okCallback?: (val?: any) => any,
        cancelCallback?: () => any, okLabel?: string, cancelLabel?: string, defaultValue?: string);

    showDialog(title: string, message: string, type?: NotificationMessageDialogType, okCallback?: (val?: any) => any,
        cancelCallback?: () => any, okLabel?: string, cancelLabel?: string, defaultValue?: string) {

        if (!type) {
            type = NotificationMessageDialogType.alert;
        }

        this.dialogs.next({title, message: message, type: type, okCallback: okCallback, cancelCallback: cancelCallback, okLabel: okLabel, cancelLabel: cancelLabel, defaultValue: defaultValue });
    }

    showMessage(summary: string);
    showMessage(summary: string, detail: string, severity: MessageSeverity);
    showMessage(summaryAndDetails: string[], summaryAndDetailsSeparator: string, severity: MessageSeverity);
    showMessage(response: HttpResponseBase, ignoreValue_useNull: string, severity: MessageSeverity);
    showMessage(data: any, separatorOrDetail?: string, severity?: MessageSeverity) {
        if (!severity) {
            severity = MessageSeverity.default;
        }

        if (data instanceof HttpResponseBase) {
            data = Utilities.getHttpResponseMessage(data);
            separatorOrDetail = Utilities.captionAndMessageSeparator;
        }

        if (data instanceof Array) {
            for (const message of data) {
                const msgObject = Utilities.splitInTwo(message, separatorOrDetail);

                this.showMessageHelper(msgObject.firstPart, msgObject.secondPart, severity, false);
            }
        } else {
            this.showMessageHelper(data, separatorOrDetail, severity, false);
        }
    }

    showStickyMessage(summary: string);
    showStickyMessage(summary: string, detail: string, severity: MessageSeverity, error?: any);
    showStickyMessage(summaryAndDetails: string[], summaryAndDetailsSeparator: string, severity: MessageSeverity);
    showStickyMessage(response: HttpResponseBase, ignoreValue_useNull: string, severity: MessageSeverity);
    showStickyMessage(data: string | string[] | HttpResponseBase, separatorOrDetail?: string, severity?: MessageSeverity, error?: any) {

        if (!severity) {
            severity = MessageSeverity.default;
        }

        if (data instanceof HttpResponseBase) {
            data = Utilities.getHttpResponseMessage(data);
            separatorOrDetail = Utilities.captionAndMessageSeparator;
        }

        if (data instanceof Array) {
            for (const message of data) {
                const msgObject = Utilities.splitInTwo(message, separatorOrDetail);

                this.showMessageHelper(msgObject.firstPart, msgObject.secondPart, severity, true);
            }
        } else {
            if (error) {
                const msg = `Severity: "${MessageSeverity[severity]}", Summary: "${data}", Detail: "${separatorOrDetail}", Error: "${Utilities.safeStringify(error)}"`;

                switch (severity) {
                    case MessageSeverity.default:
                        this.logInfo(msg);
                        break;
                    case MessageSeverity.info:
                        this.logInfo(msg);
                        break;
                    case MessageSeverity.success:
                        this.logMessage(msg);
                        break;
                    case MessageSeverity.error:
                        this.logError(msg);
                        break;
                    case MessageSeverity.warn:
                        this.logWarning(msg);
                        break;
                    case MessageSeverity.wait:
                        this.logTrace(msg);
                        break;
                }
            }

            this.showMessageHelper(data, separatorOrDetail, severity, true);
        }
    }

    showValidationError() {
        this.resetStickyMessage();
        this.showStickyMessage(this.translationService.getTranslation('form.ErrorCaption'), this.translationService.getTranslation('form.ErrorMessage'), MessageSeverity.error);
    }

    private showMessageHelper(summary: string, detail: string, severity: MessageSeverity, isSticky: boolean) {

        if (isSticky) {
            this.stickyMessages.next({ severity: severity, summary: summary, detail: detail });
        } else {
            this.messages.next({ severity: severity, summary: summary, detail: detail });
        }
    }

    startLoadingMessage(message = 'Loading...', caption = '') {
        this._isLoading = true;
        clearTimeout(this.loadingMessageId);

        this.loadingMessageId = setTimeout(() => {
            this.showStickyMessage(caption, message, MessageSeverity.wait);
        }, 1000);
    }

    stopLoadingMessage() {
        this._isLoading = false;
        clearTimeout(this.loadingMessageId);
        this.resetStickyMessage();
    }

    logDebug(msg) {
        console.debug(msg);
    }

    logError(msg) {
        console.error(msg);
    }

    logInfo(msg) {
        console.info(msg);
    }

    logMessage(msg) {
        console.log(msg);
    }

    logTrace(msg) {
        console.trace(msg);
    }

    logWarning(msg) {
        console.warn(msg);
    }

    resetStickyMessage() {
        this.stickyMessages.next();
    }

    getDialogEvent(): Observable<NotificationMessageDialog> {
        return this.dialogs.asObservable();
    }

    getMessageEvent(): Observable<NotificationMessage> {
        return this.messages.asObservable();
    }

    getStickyMessageEvent(): Observable<NotificationMessage> {
        return this.stickyMessages.asObservable();
    }

    get isLoadingInProgress(): boolean {
        return this._isLoading;
    }
}

// ******************** Dialog ********************//
export class NotificationMessageDialog {
    constructor(
        public title: string,
        public message: string,
        public type: NotificationMessageDialogType,
        public okCallback: (val?: any) => any,
        public cancelCallback: () => any,
        public defaultValue: string,
        public okLabel: string,
        public cancelLabel: string) {

    }
}

export enum NotificationMessageDialogType {
    alert,
    confirm,
    prompt
}
// ******************** End ********************//

// ******************** Growls ********************//
export class NotificationMessage {
    constructor(public severity: MessageSeverity, public summary: string, public detail: string) { }
}

export enum MessageSeverity {
    default,
    info,
    success,
    error,
    warn,
    wait
}
// ******************** End ********************//
