import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'split'
})
export class SplitPipe implements PipeTransform {

    transform(value: string, [separator]): string {
        if (value == null) {
            return '';
        }

        const splits = value.split(separator);
        if (splits.length > 1) {
            return splits.shift();
        } else {
            return '';
        }
    }

}
