import { LoggingService } from './../../services/general/logging.service';
// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component, Input, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { NgForm, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subject } from 'rxjs';

import { NotificationMessagesService, MessageSeverity } from '../../services/notification/notification-messages.service';
import { UsersService } from '../../services/users/users.service';
import { Role } from '../../models/role.model';
import { Permission } from '../../models/permission.model';
import { RolesService } from 'src/app/services/roles/roles.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'role-editor',
    templateUrl: './role-editor.component.html',
    styleUrls: ['./role-editor.component.scss']
})
export class RoleEditorComponent {
    @ViewChild('form')
    private form: NgForm;

    private selectedPermissions: SelectionModel<Permission>;
    private isNewRole = false;
    private onRoleSaved = new Subject<Role>();

    @Input() role: Role = new Role();
    @Input() allPermissions: Permission[] = [];

    roleForm: FormGroup;
    roleSaved$ = this.onRoleSaved.asObservable();

    get name() {
        return this.roleForm.get('name');
    }

    constructor(
        private notificationMessagesService: NotificationMessagesService,
        private rolesService: RolesService,
        private usersService: UsersService,
        private formBuilder: FormBuilder, private loggingService: LoggingService
    ) {
        this.buildForm();
        this.selectedPermissions = new SelectionModel<Permission>(true, []);
    }

    // tslint:disable-next-line:use-life-cycle-interface
    ngOnChanges() {
        if (this.role) {
            this.isNewRole = false;
        } else {
            this.isNewRole = true;
            this.role = new Role();
        }

        this.resetForm();
    }

    public save() {
        if (!this.form.submitted) {
            this.form.onSubmit(null);
            return;
        }

        if (!this.roleForm.valid) {
            return;
        }

        this.loggingService.logUsage('/roles/save');
        this.loggingService.startPerformanceTracker('/roles/save');
        this.notificationMessagesService.startLoadingMessage('Saving changes...');

        const editedRole = this.getEditedRole();

        if (this.isNewRole) {
            this.rolesService.newRole(editedRole).subscribe(
                role => this.saveSuccessHelper(role),
                error => this.saveFailedHelper(error));

        } else {
            this.rolesService.updateRole(editedRole).subscribe(
                () => this.saveSuccessHelper(editedRole),
                error => this.saveFailedHelper(error));
        }
    }

    private getEditedRole(): Role {
        const formModel = this.roleForm.value;

        return {
            id: this.role.id,
            name: formModel.name,
            description: formModel.description,
            permissions: this.selectedPermissions.selected,
            usersCount: 0
        };
    }

    private saveSuccessHelper(role?: Role) {
        this.notificationMessagesService.stopLoadingMessage();

        if (this.isNewRole) {
            this.notificationMessagesService.showMessage('Success', `Role \"${role.name}\" was created successfully`, MessageSeverity.success);
        } else {
            this.notificationMessagesService.showMessage('Success', `Changes to role \"${role.name}\" was saved successfully`, MessageSeverity.success);
        }

        if (!this.isNewRole) {
            if (this.usersService.currentUser.roles.some(r => r === this.role.name)) {
                this.refreshLoggedInUser();
            }

            role.usersCount = this.role.usersCount;
        }

        this.onRoleSaved.next(role);
        this.loggingService.stopPerformanceTracker('/roles/save');
    }

    private refreshLoggedInUser() {
        this.usersService.refreshLoggedInUser()
            .subscribe(() => { },
            error => {
                this.notificationMessagesService.resetStickyMessage();
                // tslint:disable-next-line:max-line-length
                this.notificationMessagesService.showStickyMessage('Refresh error', 'Unable to refresh the current session.', MessageSeverity.error, error);
            });
    }

    private saveFailedHelper(error: any) {
        this.notificationMessagesService.stopLoadingMessage();
        // tslint:disable-next-line:max-line-length
        this.notificationMessagesService.showStickyMessage('Save Error', 'An error occured while attempting to save the changes.', MessageSeverity.error, error);
    }




    private buildForm() {
        this.roleForm = this.formBuilder.group({
            name: ['', Validators.required],
            description: ''
        });
    }

    private resetForm() {
        this.roleForm.reset({
            name: this.role.name || '',
            description: this.role.description || ''
        });

        const selectePermissions = this.role.permissions
            ? this.allPermissions.filter(x => this.role.permissions.find(y => y.value === x.value))
            : [];

        this.selectedPermissions = new SelectionModel<Permission>(true, selectePermissions);
    }

    get canManageRoles() {
        return this.usersService.userHasPermission(Permission.manageRolesPermission);
    }
}
