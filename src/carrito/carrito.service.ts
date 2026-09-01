import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../productos/entities/producto.entity';
import { CreateCarritoDto } from './dto/create-carrito.dto';
import { UpdateCarritoDto } from './dto/update-carrito.dto';
import { Carrito } from './entities/carrito.entity';

@Injectable()
export class CarritoService {
  constructor(
    @InjectRepository(Carrito)
    private readonly carritoRepository: Repository<Carrito>,

    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>,
  ) {}

  async agregar(
    usuarioId: number,
    createCarritoDto: CreateCarritoDto,
  ) {
    const producto = await this.buscarProducto(
      createCarritoDto.productoId,
    );

    const itemExistente = await this.carritoRepository.findOneBy({
      usuarioId,
      productoId: createCarritoDto.productoId,
    });

    const nuevaCantidad =
      (itemExistente?.cantidad ?? 0) + createCarritoDto.cantidad;

    this.validarStock(producto, nuevaCantidad);

    if (itemExistente) {
      itemExistente.cantidad = nuevaCantidad;
      await this.carritoRepository.save(itemExistente);

      return await this.buscarItem(usuarioId, itemExistente.id);
    }

    const item = this.carritoRepository.create({
      usuarioId,
      productoId: producto.id,
      cantidad: createCarritoDto.cantidad,
    });

    const itemGuardado = await this.carritoRepository.save(item);

    return await this.buscarItem(usuarioId, itemGuardado.id);
  }

  async obtenerCarrito(usuarioId: number) {
    const items = await this.carritoRepository.find({
      where: { usuarioId },
      relations: {
        producto: {
          categoria: true,
        },
      },
      order: {
        id: 'ASC',
      },
    });

    const itemsConSubtotal = items.map((item) => ({
      ...item,
      subtotal: item.producto.precio * item.cantidad,
    }));

    const total = itemsConSubtotal.reduce(
      (acumulado, item) => acumulado + item.subtotal,
      0,
    );

    return {
      items: itemsConSubtotal,
      total,
    };
  }

  async actualizarCantidad(
    usuarioId: number,
    id: number,
    updateCarritoDto: UpdateCarritoDto,
  ) {
    const item = await this.buscarItem(usuarioId, id);

    this.validarStock(item.producto, updateCarritoDto.cantidad);

    item.cantidad = updateCarritoDto.cantidad;

    await this.carritoRepository.save(item);

    return await this.buscarItem(usuarioId, id);
  }

  async eliminarItem(usuarioId: number, id: number) {
    const item = await this.buscarItem(usuarioId, id);

    await this.carritoRepository.remove(item);

    return {
      mensaje: 'Producto eliminado del carrito',
    };
  }

  async vaciarCarrito(usuarioId: number) {
    await this.carritoRepository.delete({ usuarioId });

    return {
      mensaje: 'Carrito vaciado correctamente',
    };
  }

  private async buscarProducto(id: number): Promise<Producto> {
    const producto = await this.productosRepository.findOneBy({
      id,
      activo: true,
    });

    if (!producto) {
      throw new NotFoundException(
        `Producto con ID ${id} no encontrado`,
      );
    }

    return producto;
  }

  private async buscarItem(
    usuarioId: number,
    id: number,
  ): Promise<Carrito> {
    const item = await this.carritoRepository.findOne({
      where: {
        id,
        usuarioId,
      },
      relations: {
        producto: {
          categoria: true,
        },
      },
    });

    if (!item) {
      throw new NotFoundException(
        `Elemento del carrito con ID ${id} no encontrado`,
      );
    }

    return item;
  }

  private validarStock(
    producto: Producto,
    cantidad: number,
  ): void {
    if (cantidad > producto.stock) {
      throw new BadRequestException(
        `Stock insuficiente. Solo quedan ${producto.stock} unidades`,
      );
    }
  }
}