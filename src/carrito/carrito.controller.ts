import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolUsuario } from '../usuarios/enums/rol-usuario.enum';
import { CarritoService } from './carrito.service';
import { CreateCarritoDto } from './dto/create-carrito.dto';
import { UpdateCarritoDto } from './dto/update-carrito.dto';
import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
interface UsuarioAutenticado {
  id: number;
  correo: string;
  rol: RolUsuario;
}
@ApiTags('Carrito')
@ApiBearerAuth()
@Controller('carrito')
@UseGuards(JwtAuthGuard)  
export class CarritoController {
  constructor(
    private readonly carritoService: CarritoService,
  ) {}

  @Post()
  agregar(
    @Request() request: { user: UsuarioAutenticado },
    @Body() createCarritoDto: CreateCarritoDto,
  ) {
    return this.carritoService.agregar(
      request.user.id,
      createCarritoDto,
    );
  }

  @Get()
  obtenerCarrito(
    @Request() request: { user: UsuarioAutenticado },
  ) {
    return this.carritoService.obtenerCarrito(request.user.id);
  }

  @Patch(':id')
  actualizarCantidad(
    @Request() request: { user: UsuarioAutenticado },
    @Param('id') id: string,
    @Body() updateCarritoDto: UpdateCarritoDto,
  ) {
    return this.carritoService.actualizarCantidad(
      request.user.id,
      +id,
      updateCarritoDto,
    );
  }

  @Delete(':id')
  eliminarItem(
    @Request() request: { user: UsuarioAutenticado },
    @Param('id') id: string,
  ) {
    return this.carritoService.eliminarItem(
      request.user.id,
      +id,
    );
  }

  @Delete()
  vaciarCarrito(
    @Request() request: { user: UsuarioAutenticado },
  ) {
    return this.carritoService.vaciarCarrito(request.user.id);
  }
}