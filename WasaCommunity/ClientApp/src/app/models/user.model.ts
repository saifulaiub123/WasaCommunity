// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Appointment } from './appointment.model';

export class User {
    constructor(public id?: string, public userName?: string, public fullName?: string,
                public email?: string, public jobTitle?: string, public phoneNumber?: string,
                public imageUrl?: string, public roles?: string[], public appointments?: Appointment[],
                public appointmentStatus?: number) {
    }

    get friendlyName(): string {
        let name = this.fullName || this.userName;

        if (this.jobTitle) {
            name = this.jobTitle + ' ' + name;
        }

        return name;
    }

    public isEnabled: boolean;
    public isLockedOut: boolean;
}
