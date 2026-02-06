import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class NoGuestGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('No autenticado');
    }

    const user = await this.usersService.findById(userId);

    if (user?.role === 'guest') {
      throw new ForbiddenException(
        'Modo invitado: No puedes realizar esta acción',
      );
    }

    return true;
  }
}
