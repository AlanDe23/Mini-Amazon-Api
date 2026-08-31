import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../categorias/entities/categoria.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Producto } from './entities/producto.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>,

    @InjectRepository(Categoria)
    private readonly categoriasRepository: Repository<Categoria>,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const categoria = await this.buscarCategoria(
      createProductoDto.categoriaId,
    );

    const producto = this.productosRepository.create({
      ...createProductoDto,
      categoria,
    });

    return await this.productosRepository.save(producto);
  }

  async findAll(): Promise<Producto[]> {
    return await this.productosRepository.find({
      relations: {
        categoria: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productosRepository.findOne({
      where: { id },
      relations: {
        categoria: true,
      },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return producto;
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<Producto> {
    const producto = await this.findOne(id);

    if (updateProductoDto.categoriaId !== undefined) {
      producto.categoria = await this.buscarCategoria(
        updateProductoDto.categoriaId,
      );
    }

    Object.assign(producto, updateProductoDto);

    await this.productosRepository.save(producto);

    return await this.findOne(id);
  }

  async remove(id: number): Promise<Producto> {
    const producto = await this.findOne(id);

    return await this.productosRepository.remove(producto);
  }

  private async buscarCategoria(id: number): Promise<Categoria> {
    const categoria = await this.categoriasRepository.findOneBy({ id });

    if (!categoria) {
      throw new NotFoundException(
        `Categoría con ID ${id} no encontrada`,
      );
    }

    return categoria;
  }
}