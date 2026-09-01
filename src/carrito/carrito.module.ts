import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Producto } from '../productos/entities/producto.entity';
import { CarritoController } from './carrito.controller';
import { CarritoService } from './carrito.service';
import { Carrito } from './entities/carrito.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Carrito, Producto]),
    AuthModule,
  ],
  controllers: [CarritoController],
  providers: [CarritoService],
})
export class CarritoModule {}