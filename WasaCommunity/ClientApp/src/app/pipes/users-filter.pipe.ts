import { PipeTransform, Pipe } from '@angular/core';
import { User } from '../models/user.model';

@Pipe( {
    name: 'usersFilter'
})
export class UsersFilterPipe implements PipeTransform {
    transform(users: User[], searchTerm: string): User[] {
        if (!users || !searchTerm) {
            return users;
        }
        return users.filter(user =>
            user.fullName.toLocaleLowerCase().indexOf(searchTerm.toLowerCase()) !== -1);
    }
}
