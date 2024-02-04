// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

export class Appointment {

    constructor(public text?: string, public startDate?: Date,
                public endDate?: Date, public freeBusy?: number,
                public userId?: string, public allDay?: boolean) {

    }

}
