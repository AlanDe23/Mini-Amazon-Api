import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '../../usuarios/enums/rol-usuario.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface UsuarioAutenticado {
  id: number;
  correo: string;
  rol: RolUsuario;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesPermitidos = this.reflector.getAllAndOverride<RolUsuario[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rolesPermitidos) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: UsuarioAutenticado }>();

    return (
      request.user !== undefined &&
      rolesPermitidos.includes(request.user.rol)
    );
  }
}