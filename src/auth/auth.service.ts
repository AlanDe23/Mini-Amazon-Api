import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async registro(createUsuarioDto: CreateUsuarioDto) {
    const usuario =
      await this.usuariosService.create(createUsuarioDto);

    return {
      mensaje: 'Usuario registrado correctamente',
      usuario,
    };
  }

  async login(loginDto: LoginDto) {
    const usuario =
      await this.usuariosService.findByCorreoConPassword(
        loginDto.correo,
      );

    if (!usuario) {
      throw new UnauthorizedException(
        'Correo o contraseña incorrectos',
      );
    }

    const passwordCorrecto = await bcrypt.compare(
      loginDto.password,
      usuario.password,
    );

    if (!passwordCorrecto) {
      throw new UnauthorizedException(
        'Correo o contraseña incorrectos',
      );
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('El usuario está desactivado');
    }

    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
      accessToken,
    };
  }
}