import { ChatThreadsService } from 'src/app/services/chat/chat-threads.service';
import { LoggingService } from './logging.service';
import { AuthService } from './auth.service';
import { NotificationMessagesService, MessageSeverity } from '../notification/notification-messages.service';
import { ChatMessagesService } from 'src/app/services/chat/chat-messages.service';
import { ConfigurationService } from './configuration.service';
import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { HubConnection } from '@aspnet/signalr';
import { ChatMessage } from '../../models/chat-message.model';
import { AlertMessage } from '../../models/alert-message.model';
import { AlertMessagesService } from '../alerts/alert-messages.service';
import { ChatThread } from '../../models/chat-thread.model';

@Injectable()
export class SignalRService {

    public _hubConnection: HubConnection;

    constructor(private configurations: ConfigurationService,
        private chatMessagesService: ChatMessagesService,
        private chatThreadsService: ChatThreadsService,
        private alertMessagesService: AlertMessagesService,
        private notificationMessagesService: NotificationMessagesService,
        private authService: AuthService, private loggingService: LoggingService) {
    }

    public initializeCommunicationHub() {
        this.stopConnection();
        this.createConnection();
        this.registerOnServerEvents();
        this.startConnection();
    }

    private createConnection() {
        this._hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(this.configurations.baseUrl + '/communicationhub', {
                accessTokenFactory: () => this.authService.accessToken
            })
            .configureLogging(signalR.LogLevel.Error)
            .build();
    }

    private registerOnServerEvents() {
        this._hubConnection.on('chatMessageReceived', (chatMessage: ChatMessage) => {
            this.chatMessagesService.addMessage(chatMessage);
        });

        this._hubConnection.on('alertMessageReceived', (alertMessage: AlertMessage) => {
            this.alertMessagesService.addMessage(alertMessage);
        });
    }

    private startConnection(): void {
        this._hubConnection
            .start()
            .then(() => console.log('Hub connection started'))
            .catch(err => {
                console.log('Error while establishing connection, retrying...');
                // setInterval(() => this.startConnection(), 5000);
            });
    }

    sendChatMessage(chatMessage: ChatMessage): void {
        this.loggingService.logUsage('/communicationhub/chatmessage');
        chatMessage.thread = new ChatThread(chatMessage.thread.id, chatMessage.thread.name, chatMessage.thread.avatarSrc);
        this._hubConnection.invoke('NewChatMessageCreated', chatMessage)
            .then(() => {
                this.loggingService.stopPerformanceTracker('/communicationhub/chatmessage');
            })
            .catch(err =>
                this.notificationMessagesService.showStickyMessage('Message not sent', `Unable to send chat-message. Connection to server failed"`,
                    MessageSeverity.error, err));
    }

    sendAlertMessage(alertMessage: AlertMessage): void {
        this.loggingService.logUsage('/communicationhub/alertmessage');
        this._hubConnection.invoke('NewAlertMessageCreated', alertMessage)
            .then(() => {
                // this.notificationMessagesService.stopLoadingMessage();
                // this.notificationMessagesService.showMessage('Success', `Alert was created successfully`, MessageSeverity.success);
                this.loggingService.stopPerformanceTracker('/communicationhub/alertmessage');
            })
            .catch(err => {
                // this.notificationMessagesService.stopLoadingMessage();
                this.notificationMessagesService.showStickyMessage('Send Error', `Unable to send alert-message. Connection to server failed"`, MessageSeverity.error, err);
            });
    }

    stopConnection() {
        if (this._hubConnection) {
            this._hubConnection.stop();
            this._hubConnection = null;
        }
    }
}
