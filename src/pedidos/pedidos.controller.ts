import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolUsuario } from '../usuarios/enums/rol-usuario.enum';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { PedidosService } from './pedidos.service';
import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
interface UsuarioAutenticado {
  id: number;
  correo: string;
  rol: RolUsuario;
}
@ApiTags('Pedidos')
@ApiBearerAuth()
@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosController {
  constructor(
    private readonly pedidosService: PedidosService,
  ) {}

  @Post()
  crearPedido(
    @Request() request: { user: UsuarioAutenticado },
    @Body() createPedidoDto: CreatePedidoDto,
  ) {
    return this.pedidosService.crearPedido(
      request.user.id,
      createPedidoDto,
    );
  }

  @Roles(RolUsuario.ADMIN)
  @UseGuards(RolesGuard)
  @Get('admin/todos')
  obtenerTodos() {
    return this.pedidosService.obtenerTodos();
  }

  @Roles(RolUsuario.ADMIN)
  @UseGuards(RolesGuard)
  @Patch('admin/:id/estado')
  actualizarEstado(
    @Param('id') id: string,
    @Body() updatePedidoDto: UpdatePedidoDto,
  ) {
    return this.pedidosService.actualizarEstado(
      +id,
      updatePedidoDto.estado,
    );
  }

  @Get()
  obtenerMisPedidos(
    @Request() request: { user: UsuarioAutenticado },
  ) {
    return this.pedidosService.obtenerMisPedidos(
      request.user.id,
    );
  }

  @Get(':id')
  obtenerMiPedido(
    @Request() request: { user: UsuarioAutenticado },
    @Param('id') id: string,
  ) {
    return this.pedidosService.obtenerMiPedido(
      request.user.id,
      +id,
    );
  }
}