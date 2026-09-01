import { IsEnum } from 'class-validator';
import { EstadoPedido } from '../enums/estado-pedido.enum';

export class UpdatePedidoDto {
  @IsEnum(EstadoPedido)
  estado!: EstadoPedido;
}