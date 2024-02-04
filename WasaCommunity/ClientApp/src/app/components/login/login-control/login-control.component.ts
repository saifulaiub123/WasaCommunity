// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component, OnInit, OnDestroy, Input, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NotificationMessagesService, MessageSeverity, NotificationMessageDialogType } from '../../../services/notification/notification-messages.service';
import { AuthService } from '../../../services/general/auth.service';
import { ConfigurationService } from '../../../services/general/configuration.service';
import { Utilities } from '../../../shared/utilities';
import { UserLogin } from '../../../models/user-login.model';

@Component({
    selector: 'login-control',
    templateUrl: './login-control.component.html',
    styleUrls: ['./login-control.component.scss']
})
export class LoginControlComponent implements OnInit, OnDestroy {
    loginForm: FormGroup;

    isLoading = false;
    formResetToggle = true;
    modalClosedCallback: () => void;
    loginStatusSubscription: any;

    @Input()
    isModal = false;

    constructor(
        private notificationMessagesService: NotificationMessagesService,
        private authService: AuthService,
        private configurations: ConfigurationService,
        private formBuilder: FormBuilder) {
        this.buildForm();
    }

    ngOnInit() {
        this.loginForm.setValue({
            userName: '',
            password: '',
            rememberMe: this.authService.rememberMe
        });

        if (this.getShouldRedirect()) {
            this.authService.redirectLoginUser();
        } else {
            this.loginStatusSubscription = this.authService.getLoginStatusEvent()
                .subscribe(isLoggedIn => {
                    if (this.getShouldRedirect()) {
                        this.authService.redirectLoginUser();
                    }
                });
        }
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        if (this.loginStatusSubscription) {
            this.loginStatusSubscription.unsubscribe();
        }
    }

    buildForm() {
        this.loginForm = this.formBuilder.group({
            userName: ['', Validators.required],
            password: ['', Validators.required],
            rememberMe: ''
        });
    }

    get userName() { return this.loginForm.get('userName'); }

    get password() { return this.loginForm.get('password'); }

    getShouldRedirect() {
        return !this.isModal && this.authService.isLoggedIn && !this.authService.isSessionExpired;
    }

    showErrorAlert(caption: string, message: string) {
        this.notificationMessagesService.showMessage(caption, message, MessageSeverity.error);
    }

    closeModal() {
        if (this.modalClosedCallback) {
            this.modalClosedCallback();
        }
    }

    getUserLogin(): UserLogin {
        const formModel = this.loginForm.value;
        return new UserLogin(formModel.userName, formModel.password, formModel.rememberMe);
    }

    login() {
        this.isLoading = true;
        this.notificationMessagesService.startLoadingMessage('', 'Attempting login...');

        this.authService.login(this.getUserLogin())
            .subscribe(
            user => {
                setTimeout(() => {
                    this.notificationMessagesService.stopLoadingMessage();
                    this.isLoading = false;
                    this.reset();

                    if (!this.isModal) {
                        this.notificationMessagesService.showMessage('Login', `Welcome ${user.fullName}!`, MessageSeverity.success);
                    } else {
                        this.notificationMessagesService.showMessage('Login', `Session for ${user.fullName} restored!`, MessageSeverity.success);
                        setTimeout(() => {
                            this.notificationMessagesService.showStickyMessage('Session Restored', 'Please try your last operation again', MessageSeverity.default);
                        }, 500);

                        this.closeModal();
                    }
                }, 500);
            },
            error => {
                this.notificationMessagesService.stopLoadingMessage();

                if (Utilities.checkNoNetwork(error)) {
                  this.notificationMessagesService.showStickyMessage(Utilities.noNetworkMessageCaption, Utilities.noNetworkMessageDetail, MessageSeverity.error, error);
                  this.offerAlternateHost();
                } else {
                    const errorMessage = Utilities.findHttpResponseMessage('error_description', error) || Utilities.findHttpResponseMessage('error', error);

                    if (errorMessage) {
                        this.notificationMessagesService.showStickyMessage('Unable to login',
                        this.mapLoginErrorMessage(errorMessage), MessageSeverity.error, error);
                    } else {
                        this.notificationMessagesService.showStickyMessage('Unable to login',
                        'An error occured, please try again later.\nError: ' + error.statusText || error.status, MessageSeverity.error, error);
                    }
                }
                setTimeout(() => {
                    this.isLoading = false;
                }, 500);
            });
    }


    offerAlternateHost() {

      if (Utilities.checkIsLocalHost(location.origin) && Utilities.checkIsLocalHost(this.configurations.baseUrl)) {

        const apiUrl = prompt('Dear Developer!\nIt appears your backend Web API service is not running...\n' +
          'Would you want to temporarily switch to the online Demo API below?(Or specify another)', this.configurations.fallbackBaseUrl);

        if (apiUrl) {
          this.configurations.baseUrl = apiUrl;
          this.configurations.tokenUrl = apiUrl;
          this.notificationMessagesService.showStickyMessage('API Changed!', 'The target Web API has been changed to: ' + apiUrl, MessageSeverity.warn);
        }
      }
    }


    mapLoginErrorMessage(error: string) {

        if (error === 'invalid_username_or_password') {
            return 'Invalid username or password';
        }

        if (error === 'invalid_grant') {
            return 'This account has been disabled';
        }

        return error;
    }

    reset() {
        this.formResetToggle = false;

        setTimeout(() => {
            this.formResetToggle = true;
        });
    }
}
