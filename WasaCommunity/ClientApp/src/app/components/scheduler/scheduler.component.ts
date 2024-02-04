// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { DxSchedulerComponent } from 'devextreme-angular';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'scheduler',
    templateUrl: './scheduler.component.html',
    styleUrls: ['./scheduler.component.scss']
})
export class SchedulerComponent implements OnInit {

    @ViewChild(DxSchedulerComponent) scheduler: DxSchedulerComponent;

    currentDate = new Date();
    auto: any;

    constructor(public dialogRef: MatDialogRef<SchedulerComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { user: User }) {

    }

    ngOnInit() {

    }

    close() {
        this.dialogRef.close();
    }

    getAvatarForUser(user: User): string {
        return require('../../assets/images/Avatars/' + user.imageUrl);
    }

    onContentReady(e) {
        const currentHour = new Date().getHours() - 1;

        e.component.scrollToTime(currentHour, 30, new Date());
    }

    onAppointmentClick(event: any) {
        event.cancel = true;
    }

    formatTime(time: string): string {
        switch (time) {
            case '12:00 AM': {
                return '00:00';
            }

            case '1:00 AM': {
                return '01:00';
            }

            case '2:00 AM': {
                return '02:00';
            }

            case '3:00 AM': {
                return '03:00';
            }

            case '4:00 AM': {
                return '04:00';
            }

            case '5:00 AM': {
                return '05:00';
            }

            case '6:00 AM': {
                return '06:00';
            }

            case '7:00 AM': {
                return '07:00';
            }

            case '8:00 AM': {
                return '08:00';
            }

            case '9:00 AM': {
                return '09:00';
            }

            case '10:00 AM': {
                return '10:00';
            }

            case '11:00 AM': {
                return '11:00';
            }

            case '12:00 PM': {
                return '12:00';
            }

            case '1:00 PM': {
                return '13:00';
            }

            case '2:00 PM': {
                return '14:00';
            }

            case '3:00 PM': {
                return '15:00';
            }

            case '4:00 PM': {
                return '16:00';

            }

            case '5:00 PM': {
                return '17:00';
            }

            case '6:00 PM': {
                return '18:00';
            }

            case '7:00 PM': {
                return '19:00';
            }

            case '8:00 PM': {
                return '20:00';
            }

            case '9:00 PM': {
                return '21:00';
            }

            case '10:00 PM': {
                return '22:00';
            }

            case '11:00 PM': {
                return '23:00';
            }

        }
    }

}
