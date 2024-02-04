import { PipeTransform, Pipe } from '@angular/core';
import { AlertMessage } from '../models/alert-message.model';
import { Alert } from '../models/alert.model';


@Pipe( {
    name: 'alertsFilter'
})
export class AlertsFilterPipe implements PipeTransform {
    transform(alerts: Alert[], searchTerm: string): Alert[] {
        if (!alerts || !searchTerm) {
            return alerts;
        }
        return alerts.filter(alert =>
            alert.alertMessage.author.fullName.toLocaleLowerCase().indexOf(searchTerm.toLowerCase()) !== -1);
    }
}
