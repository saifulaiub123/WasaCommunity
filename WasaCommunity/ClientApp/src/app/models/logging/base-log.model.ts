// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

export class BaseLog {

    constructor(public id?: number, public timestamp?: Date, public layer?: string, public location?: string,
                public message?: string, public userId?: string, public userName?: string,
                public hostName?: string, ) { }
}
