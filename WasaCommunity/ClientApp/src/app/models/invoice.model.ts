// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

export class Invoice {

    constructor(public id?: string, public isCredit?: boolean, public invoiceNumber?: number,
                public companyName?: string, public warehouse?: string, public invoiceDate?: Date,
                public expiryDate?: Date, public amount?: number) { }
}
