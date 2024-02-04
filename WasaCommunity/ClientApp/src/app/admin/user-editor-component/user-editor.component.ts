import { LoggingService } from './../../services/general/logging.service';
// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component, OnDestroy, ViewChild, Input, Output, OnChanges, EventEmitter } from '@angular/core';
import { NgForm, FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';

import { Subject, Subscription } from 'rxjs';

import { UsersService } from '../../services/users/users.service';
import { NotificationMessagesService, MessageSeverity } from '../../services/notification/notification-messages.service';
import { AppTranslationService } from '../../services/general/app-translation.service';
import { Utilities } from '../../shared/utilities';
import { User } from '../../models/user.model';
import { UserEdit } from '../../models/user-edit.model';
import { Role } from '../../models/role.model';
import { Permission } from '../../models/permission.model';
import { EqualValidator } from '../../shared/validators/equal.validator';
import { RolesService } from 'src/app/services/roles/roles.service';

@Component({
    selector: 'user-editor',
    templateUrl: './user-editor.component.html',
    styleUrls: ['./user-editor.component.scss']
})
export class UserEditorComponent implements OnChanges, OnDestroy {
    @ViewChild('form')
    private form: NgForm;

    isNewUser = false;
    isChangePassword = false;
    private isSaving = false;
    private passwordWatcher: Subscription;
    private onUserSaved = new Subject<User>();

    @Input() user: User = new User();
    @Input() roles: Role[] = [];
    @Input() isEditMode = false;

    userProfileForm: FormGroup;
    userSaved$ = this.onUserSaved.asObservable();

    get userName() {
        return this.userProfileForm.get('userName');
    }

    get email() {
        return this.userProfileForm.get('email');
    }

    get password() {
        return this.userProfileForm.get('password');
    }

    get currentPassword() {
        return this.password.get('currentPassword');
    }

    get newPassword() {
        return this.password.get('newPassword');
    }

    get confirmPassword() {
        return this.password.get('confirmPassword');
    }

    get assignedRoles() {
        return this.userProfileForm.get('roles');
    }

    get canViewRoles() {
        return this.usersService.userHasPermission(Permission.viewRolesPermission);
    }

    get canAssignRoles() {
        return this.usersService.userHasPermission(Permission.assignRolesPermission);
    }

    get isEditingSelf() {
        return this.usersService.currentUser ? this.user.id === this.usersService.currentUser.id : false;
    }

    get assignableRoles(): Role[] {
        return this.roles;
    }

    get floatLabels(): string {
        return this.isEditMode ? 'auto' : 'always';
    }

    constructor(
        private notificationMessagesService: NotificationMessagesService,
        private translationService: AppTranslationService,
        private rolesService: RolesService,
        private usersService: UsersService,
        private formBuilder: FormBuilder,
        private loggingService: LoggingService
    ) {
        this.buildForm();
    }

    ngOnChanges() {
        if (this.user) {
            this.isNewUser = false;
        } else {
            this.isNewUser = true;
            this.user = new User();
            this.user.isEnabled = true;
        }

        this.setRoles();

        this.resetForm();
    }

    ngOnDestroy() {
        this.passwordWatcher.unsubscribe();
    }

    public setUser(user?: User, roles?: Role[]) {
        this.user = user;
        if (roles) {
            this.roles = [...roles];
        }

        this.ngOnChanges();
    }

    private buildForm() {
        this.userProfileForm = this.formBuilder.group({
            jobTitle: '',
            userName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: this.formBuilder.group({
                currentPassword: ['', Validators.required],
                newPassword: ['', [Validators.required, Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,}/)]],
                confirmPassword: ['', [Validators.required, EqualValidator('newPassword')]],
            }),
            roles: ['', Validators.required],
            fullName: '',
            phoneNumber: '',
            isEnabled: ''
        });

        this.passwordWatcher = this.newPassword.valueChanges.subscribe(() => this.confirmPassword.updateValueAndValidity());
    }

    public resetForm(stopEditing: boolean = false) {
        if (stopEditing) {
            this.isEditMode = false;
        }

        if (!this.user) {
            this.isNewUser = true;
            this.user = new User();
        }

        if (this.isNewUser) {
            this.isChangePassword = true;
            this.addNewPasswordValidators();
        } else {
            this.isChangePassword = false;
            this.newPassword.clearValidators();
            this.confirmPassword.clearValidators();
        }

        this.currentPassword.clearValidators();

        this.userProfileForm.reset({
            jobTitle: this.user.jobTitle || '',
            userName: this.user.userName || '',
            email: this.user.email || '',
            password: {
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            },
            roles: this.user.roles || [],
            fullName: this.user.fullName || '',
            phoneNumber: this.user.phoneNumber || '',
            isEnabled: this.user.isEnabled
        });
    }

    private setRoles() {
        if (this.user.roles) {
            for (const role of this.user.roles) {
                if (!this.roles.some(r => r.name === role)) {
                    this.roles.unshift(new Role(role));
                }
            }
        }
    }

    public beginEdit() {
        this.isEditMode = true;
        this.isChangePassword = false;
    }

    public save() {
        if (!this.form.submitted) {
            // Causes validation to update.
            this.form.onSubmit(null);
            return;
        }

        if (!this.userProfileForm.valid) {
            this.notificationMessagesService.showValidationError();
            return;
        }

        this.loggingService.logUsage('/users/save');
        this.loggingService.startPerformanceTracker('/users/save');
        this.isSaving = true;
        this.notificationMessagesService.startLoadingMessage('Saving changes...');

        const editedUser = this.getEditedUser();

        if (this.isNewUser) {
            this.usersService.newUser(editedUser).subscribe(
                user => this.saveCompleted(user),
                error => this.saveFailed(error));
        } else {
            this.usersService.updateUser(editedUser).subscribe(
                response => this.saveCompleted(editedUser),
                error => this.saveFailed(error));
        }
    }

    public cancel() {
        this.resetForm();
        this.isEditMode = false;

        this.notificationMessagesService.resetStickyMessage();
    }

    private getEditedUser(): UserEdit {
        const formModel = this.userProfileForm.value;

        return {
            id: this.user.id,
            jobTitle: formModel.jobTitle,
            userName: formModel.userName,
            fullName: formModel.fullName,
            friendlyName: formModel.friendlyName,
            email: formModel.email,
            phoneNumber: formModel.phoneNumber,
            imageUrl: this.user.imageUrl,
            roles: formModel.roles,
            currentPassword: formModel.password.currentPassword,
            newPassword: this.isChangePassword ? formModel.password.newPassword : null,
            confirmPassword: this.isChangePassword ? formModel.password.confirmPassword : null,
            isEnabled: formModel.isEnabled,
            isLockedOut: this.user.isLockedOut
        };
    }

    private saveCompleted(user?: User) {
        if (user) {
            this.raiseEventIfRolesModified(this.user, user);
            this.user = user;
        }

        this.isSaving = false;
        this.notificationMessagesService.stopLoadingMessage();

        this.resetForm(true);

        this.onUserSaved.next(this.user);
        this.loggingService.stopPerformanceTracker('/users/save');
    }

    private saveFailed(error: any) {
        this.isSaving = false;
        this.notificationMessagesService.stopLoadingMessage();
        this.notificationMessagesService.showStickyMessage('Save Error', 'An error occured while attempting to save the changes.', MessageSeverity.error, error);
    }

    private raiseEventIfRolesModified(currentUser: User, editedUser: User) {
        const rolesAdded = this.isNewUser ? editedUser.roles : editedUser.roles.filter(role => currentUser.roles.indexOf(role) === -1);
        const rolesRemoved = this.isNewUser ? [] : currentUser.roles.filter(role => editedUser.roles.indexOf(role) === -1);

        const modifiedRoles = rolesAdded.concat(rolesRemoved);

        if (modifiedRoles.length) {
            setTimeout(() => this.rolesService.onRolesUserCountChanged(modifiedRoles));
        }
    }

    private changePassword() {
        this.isChangePassword = true;
        this.addCurrentPasswordValidators();
        this.addNewPasswordValidators();
    }

    private addCurrentPasswordValidators() {
        this.currentPassword.setValidators(Validators.required);
    }

    private addNewPasswordValidators() {
        this.newPassword.setValidators([Validators.required, Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,}/)]);
        this.confirmPassword.setValidators([Validators.required, EqualValidator('newPassword')]);
    }

    private unlockUser() {
        this.isSaving = true;
        this.notificationMessagesService.startLoadingMessage('Unblocking user...');

        this.usersService.unblockUser(this.user.id)
            .subscribe(response => {
                this.isSaving = false;
                this.user.isLockedOut = false;
                this.userProfileForm.patchValue({
                    isLockedOut: this.user.isLockedOut
                });
                this.notificationMessagesService.stopLoadingMessage();
                this.notificationMessagesService.showMessage('Success', 'User has been successfully unlocked', MessageSeverity.success);
            },
            error => {
                this.isSaving = false;
                this.notificationMessagesService.stopLoadingMessage();
                this.notificationMessagesService.showStickyMessage('Unblock Error', 'An error occured while attempting to unblock the user.', MessageSeverity.error, error);
            });
    }
}
