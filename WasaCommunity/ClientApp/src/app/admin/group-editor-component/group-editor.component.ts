import { LoggingService } from './../../services/general/logging.service';

// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component, Input, ViewChild, OnInit, OnChanges, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NgForm, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

import { Subject, BehaviorSubject } from 'rxjs';

import { NotificationMessagesService, MessageSeverity } from '../../services/notification/notification-messages.service';
import { GroupsService } from '../../services/group/groups.service';
import { Group } from 'src/app/models/group.model';
import { UsersService } from '../../services/users/users.service';
import { Permission } from 'src/app/models/permission.model';
import { User } from 'src/app/models/user.model';
import * as _ from 'lodash';
import { MatSelectionList } from '@angular/material';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'group-editor',
    templateUrl: './group-editor.component.html',
    styleUrls: ['./group-editor.component.scss']
})
export class GroupEditorComponent implements OnChanges, AfterViewInit {

    @ViewChild('form')
    private form: NgForm;

    @ViewChild('membersList') membersList: MatSelectionList;

    private isNewGroup = false;
    private onGroupSaved = new Subject<Group>();

    @Input() group: Group = new Group();
    @Input() users: User[] = [];

    groupForm: FormGroup;
    groupSaved$ = this.onGroupSaved.asObservable();

    amountOfRecipientsSelected = 0;

    get name() {
        return this.groupForm.get('name');
    }

    constructor(
        private notificationMessagesService: NotificationMessagesService,
        private groupService: GroupsService,
        private formBuilder: FormBuilder,
        private usersService: UsersService,
        private cdr: ChangeDetectorRef,
        private loggingService: LoggingService
    ) {

    }
    ngOnInit() {
        this.buildForm();

    }

    ngAfterViewInit() {
        this.membersList.options.map(
            option => {
                const user: User = option.value;
                if (this.isMember(user)) {
                    option.selected = true;
                }
                if (option.selected === true) {
                    this.amountOfRecipientsSelected++;
                }
            }
        );
        this.cdr.detectChanges();
    }
    // tslint:disable-next-line:use-life-cycle-interface
    ngOnChanges() {
        if (this.group) {
            this.isNewGroup = false;
        } else {
            this.isNewGroup = true;
            this.group = new Group();
        }
        if (this.groupForm !== undefined) {
            this.resetForm();
        }
    }

    private buildForm() {
        this.groupForm = this.formBuilder.group({
            name: [this.group.name, Validators.required],
            members: new FormControl([])
        });

    }


    private resetForm() {
        this.groupForm.reset({
            name: this.group.name || '',
            members: this.group.members || ''
        });
    }

    onMembersChanged(event: any) {
        if (event.option.selected === true) {
            this.amountOfRecipientsSelected++;
        } else {
            this.amountOfRecipientsSelected--;
        }
    }

    public save() {

        if (!this.form.submitted) {
            this.form.onSubmit(null);
            return;
        }

        if (!this.groupForm.valid) {
            return;
        }

        this.loggingService.logUsage('/groups/save');
        this.loggingService.startPerformanceTracker('/groups/save');
        this.notificationMessagesService.startLoadingMessage('Saving changes...');

        const editedGroup = this.getEditedGroup();

        if (this.isNewGroup) {
            this.groupService.newGroup(editedGroup).subscribe(
                group => this.saveSuccessHelper(group),
                error => this.saveFailedHelper(error));

        } else {
            this.groupService.updateGroup(editedGroup).subscribe(
                () => this.saveSuccessHelper(editedGroup),
                error => this.saveFailedHelper(error));
        }
    }

    private getEditedGroup(): Group {
        const members: User[] = [];
        this.membersList.selectedOptions.selected.map(selected => members.push(selected.value));

        return {
            id: this.group.id,
            name: this.groupForm.controls.name.value,
            usersCount: members.length,
            members: members
        };
    }

    private saveSuccessHelper(group?: Group) {
        this.notificationMessagesService.stopLoadingMessage();

        if (this.isNewGroup) {
            this.notificationMessagesService.showMessage('Success', `Group \"${group.name}\" was created successfully`, MessageSeverity.success);
        } else {
            this.notificationMessagesService.showMessage('Success', `Changes to group \"${group.name}\" was saved successfully`, MessageSeverity.success);
        }

        this.onGroupSaved.next(group);
        this.loggingService.stopPerformanceTracker('/groups/save');
    }

    private saveFailedHelper(error: any) {
        this.notificationMessagesService.stopLoadingMessage();
        this.notificationMessagesService.showStickyMessage('Save Error', 'An error occured while attempting to save the changes', MessageSeverity.error, error);
    }

    getAvatarForUser(user: User): string {
        return require('../../assets/images/Avatars/' + user.imageUrl);
    }

    isMember(user: User) {
        if (_.find(this.group.members, { id: user.id })) {
            return true;
        } else {
            return false;
        }
    }

    get canManageGroups() {
        return this.groupService.userHasPermission(Permission.manageGroupsPermission);
    }

    get members(): FormArray {
        return this.groupForm.get('members') as FormArray;
    }
}
