// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Utilities } from '../shared/utilities';


export class Notification {
    public id: number;
    public header: string;
    public body: string;
    public isRead: boolean;
    public isPinned: boolean;
    public date: Date;

    public static Create(data: {}) {
        const n = new Notification();
        Object.assign(n, data);

        if (n.date) {
            n.date = Utilities.parseDate(n.date);
        }

        return n;
    }
}
