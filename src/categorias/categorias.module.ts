import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CategoriasController } from './categorias.controller';
import { CategoriasService } from './categorias.service';
import { Categoria } from './entities/categoria.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Categoria]),
    AuthModule,
  ],
  controllers: [CategoriasController],
  providers: [CategoriasService],
})
export class CategoriasModule {}