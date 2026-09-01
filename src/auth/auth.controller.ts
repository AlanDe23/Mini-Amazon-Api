import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { RolUsuario } from '../usuarios/enums/rol-usuario.enum';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
interface UsuarioAutenticado {
  id: number;
  correo: string;
  rol: RolUsuario;
}
@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  registro(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.authService.registro(createUsuarioDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  perfil(
    @Request() request: { user: UsuarioAutenticado },
  ): UsuarioAutenticado {
    return request.user;
  }
}