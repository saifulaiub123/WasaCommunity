// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Order } from './order.model';

export class OrdersByPerson {

    constructor(public salesPerson?: string, public email?: string, public totalSumInSek?: number,
                public amountOfOrders?: number, public orders?: Order[]) { }
}
