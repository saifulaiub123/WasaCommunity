// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { SignalRService } from '../../../services/general/signal-r.service';
import { AlertRecipient } from './../../../models/alert-recipient.model';
import { MinimalUser } from './../../../models/minimal-user.model';
import { UsersService } from '../../../services/users/users.service';
import { NotificationMessagesService, MessageSeverity } from 'src/app/services/notification/notification-messages.service';
import { Component, OnInit, Inject, ViewChild, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSelectionList } from '@angular/material';
import { AlertMessage } from 'src/app/models/alert-message.model';
import { Group } from 'src/app/models/group.model';
import { User } from 'src/app/models/user.model';
import { NgForm, FormGroup, FormBuilder, FormArray, Validators, FormControl, AbstractControl } from '@angular/forms';
import * as _ from 'lodash';
import { LoggingService } from './../../../services/general/logging.service';

@Component({
    selector: 'alert-create',
    templateUrl: './alert-create.component.html',
    styleUrls: ['./alert-create.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AlertCreateComponent implements OnInit {

    @ViewChild('form') form: NgForm;
    @ViewChild('recipientsList') recipientsList: MatSelectionList;

    alertForm: FormGroup;
    recipientsFormGroup: FormGroup;
    messageFormGroup: FormGroup;

    currentUser: User;
    amountOfRecipientsSelected = 0;

    constructor(public dialogRef: MatDialogRef<AlertCreateComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { groups: Group[], users: User[] },
        private formBuilder: FormBuilder, private notificationMessagesService: NotificationMessagesService,
        private usersService: UsersService, private signalRService: SignalRService,
        private loggingService: LoggingService) { }

    ngOnInit() {
        this.currentUser = this.usersService.currentUser;
        this.buildForm();
    }

    private buildForm() {
        this.alertForm = this.formBuilder.group({
            formArray: this.formBuilder.array([
                this.formBuilder.group({
                    groups: new FormControl([]),
                    users: new FormControl([], Validators.required),
                }),
                this.formBuilder.group({
                    title: ['', [Validators.required, Validators.maxLength(60)]],
                    body: ['']
                })
            ]),
        });

        this.recipientsFormGroup = this.formBuilder.group({
            groups: new FormControl([]),
            users: new FormControl([]),
        });

        this.messageFormGroup = this.formBuilder.group({
            title: ['', Validators.required],
            body: ['']
        });
    }

    recipientClicked(event: any) {
        if (event.option.selected === true) {
            this.amountOfRecipientsSelected++;
        } else {
            this.amountOfRecipientsSelected--;
        }
    }

    selectRecipientsFromGroup(event: any) {
        this.amountOfRecipientsSelected = 0;

        const group: Group = event.option.value;

        this.recipientsList.options.map(
            option => {
                const user: User = option.value;
                if (this.isMember(group, user)) {
                    option.selected = event.option.selected;
                }
                if (option.selected === true) {
                    this.amountOfRecipientsSelected++;
                }
            }
        );
    }

    isMember(group: Group, user: User) {
        if (_.find(group.members, { id: user.id })) {
            return true;
        } else {
            return false;
        }
    }

    close() {
        this.dialogRef.close();
    }

    getAvatarForUser(user: User): string {
        return require('../../../assets/images/Avatars/' + user.imageUrl);
    }

    public send() {
        if (!this.form.submitted) {
            this.form.onSubmit(null);
            return;
        }

        if (!this.alertForm.valid) {
            return;
        }

        // this.notificationMessagesService.startLoadingMessage('Creating Alert...');
        this.loggingService.startPerformanceTracker('/communicationhub/alertmessage');
        const alert = this.getAlert();
        this.signalRService.sendAlertMessage(alert);
        this.dialogRef.close(null);
    }

    cancel(): void {
        this.dialogRef.close(null);
    }

    private getAlert(): AlertMessage {
        const author = this.currentUser as MinimalUser;
        const alertRecipients: AlertRecipient[] = [];

        this.recipientsList.options.map(option => {
            const user: User = option.value;
            if (option.selected === true) {
                const alertRecipient = new AlertRecipient();
                alertRecipient.isDeleted = false;
                alertRecipient.isRead = false;
                alertRecipient.recipientId = user.id;
                alertRecipients.push(alertRecipient);
            }
        });

        return {
            author: author,
            title: this.alertForm.controls.formArray.value[1].title,
            body: this.alertForm.controls.formArray.value[1].body,
            recipients: alertRecipients
        };
    }

    get groups() {
        return this.data.groups;
    }

    get users() {
        return this.data.users;
    }

    get title() {
        return this.formArray.get([1]).get('title');
    }

    get recipients() {
        return this.formArray.get([0]).get('users');
    }

    set users(users) {
        this.users = users;
    }

    get formArray(): AbstractControl | null { return this.alertForm.get('formArray'); }
}
