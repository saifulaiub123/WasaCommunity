import { Injectable } from '@angular/core';
import { NotificationEndpoint } from './notification-endpoint.service';
import { Observable } from 'rxjs';

@Injectable()
export class PushNotificationService {

    constructor(private notificationEndpoint: NotificationEndpoint) { }


    newPushSubscriber(userId: string, notificationSubscriber: any): Observable<any> {
        return this.notificationEndpoint.getNewPushSubscriberEndpoint<any>(userId, notificationSubscriber);
    }
}
