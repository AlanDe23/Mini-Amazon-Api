import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Carrito } from '../carrito/entities/carrito.entity';
import { Producto } from '../productos/entities/producto.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { Pedido } from './entities/pedido.entity';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pedido,
      DetallePedido,
      Carrito,
      Producto,
    ]),
    AuthModule,
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}