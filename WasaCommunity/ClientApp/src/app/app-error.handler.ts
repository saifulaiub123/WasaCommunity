// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { LoggingService } from './services/general/logging.service';


@Injectable()
export class AppErrorHandler implements ErrorHandler {

    constructor(private injector: Injector) {
     }

    handleError(error: any) {
       const loggingService = this.injector.get(LoggingService);

       const message = error.message ? error.message : error.toString();

       loggingService.logError(message, error);

       throw error;
    }

}
