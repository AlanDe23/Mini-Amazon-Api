import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Carrito } from '../carrito/entities/carrito.entity';
import { Producto } from '../productos/entities/producto.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { Pedido } from './entities/pedido.entity';
import { EstadoPedido } from './enums/estado-pedido.enum';

@Injectable()
export class PedidosService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Pedido)
    private readonly pedidosRepository: Repository<Pedido>,
  ) {}

  async crearPedido(
    usuarioId: number,
    createPedidoDto: CreatePedidoDto,
  ): Promise<Pedido> {
    return await this.dataSource.transaction(async (manager) => {
      const itemsCarrito = await manager.find(Carrito, {
        where: {
          usuarioId,
        },
      });

      if (itemsCarrito.length === 0) {
        throw new BadRequestException('El carrito está vacío');
      }

      const productosCompra: Array<{
        producto: Producto;
        cantidad: number;
        subtotal: number;
      }> = [];

      let total = 0;

      for (const item of itemsCarrito) {
        const producto = await manager.findOne(Producto, {
          where: {
            id: item.productoId,
          },
          lock: {
            mode: 'pessimistic_write',
          },
        });

        if (!producto || !producto.activo) {
          throw new BadRequestException(
            `El producto con ID ${item.productoId} ya no está disponible`,
          );
        }

        if (item.cantidad > producto.stock) {
          throw new BadRequestException(
            `Stock insuficiente para ${producto.nombre}. ` +
              `Disponibles: ${producto.stock}`,
          );
        }

        const subtotal = producto.precio * item.cantidad;

        total += subtotal;

        productosCompra.push({
          producto,
          cantidad: item.cantidad,
          subtotal,
        });
      }

      const pedido = manager.create(Pedido, {
        usuarioId,
        direccionEnvio: createPedidoDto.direccionEnvio.trim(),
        metodoPago: createPedidoDto.metodoPago,
        estado: EstadoPedido.PENDIENTE,
        total,
      });

      const pedidoGuardado = await manager.save(Pedido, pedido);

      const detalles = productosCompra.map((item) =>
        manager.create(DetallePedido, {
          pedidoId: pedidoGuardado.id,
          productoId: item.producto.id,
          productoNombre: item.producto.nombre,
          cantidad: item.cantidad,
          precioUnitario: item.producto.precio,
          subtotal: item.subtotal,
        }),
      );

      const detallesGuardados = await manager.save(
        DetallePedido,
        detalles,
      );

      for (const item of productosCompra) {
        item.producto.stock -= item.cantidad;

        await manager.save(Producto, item.producto);
      }

      await manager.delete(Carrito, {
        usuarioId,
      });

      pedidoGuardado.detalles = detallesGuardados;

      return pedidoGuardado;
    });
  }

  async obtenerMisPedidos(usuarioId: number): Promise<Pedido[]> {
    return await this.pedidosRepository.find({
      where: {
        usuarioId,
      },
      relations: {
        detalles: true,
      },
      order: {
        fechaCreacion: 'DESC',
      },
    });
  }

  async obtenerMiPedido(
    usuarioId: number,
    id: number,
  ): Promise<Pedido> {
    const pedido = await this.pedidosRepository.findOne({
      where: {
        id,
        usuarioId,
      },
      relations: {
        detalles: true,
      },
    });

    if (!pedido) {
      throw new NotFoundException(
        `Pedido con ID ${id} no encontrado`,
      );
    }

    return pedido;
  }
  
  async obtenerTodos(): Promise<Pedido[]> {
  return await this.pedidosRepository.find({
    relations: {
      usuario: true,
      detalles: true,
    },
    order: {
      fechaCreacion: 'DESC',
    },
  });
}

async actualizarEstado(
  id: number,
  nuevoEstado: EstadoPedido,
): Promise<Pedido> {
  await this.dataSource.transaction(async (manager) => {
    const pedido = await manager.findOne(Pedido, {
      where: { id },
      lock: {
        mode: 'pessimistic_write',
      },
    });

    if (!pedido) {
      throw new NotFoundException(
        `Pedido con ID ${id} no encontrado`,
      );
    }

    this.validarCambioEstado(pedido.estado, nuevoEstado);

    if (nuevoEstado === EstadoPedido.CANCELADO) {
      const detalles = await manager.find(DetallePedido, {
        where: {
          pedidoId: pedido.id,
        },
      });

      for (const detalle of detalles) {
        if (detalle.productoId === null) {
          continue;
        }

        const producto = await manager.findOne(Producto, {
          where: {
            id: detalle.productoId,
          },
          lock: {
            mode: 'pessimistic_write',
          },
        });

        if (producto) {
          producto.stock += detalle.cantidad;
          await manager.save(Producto, producto);
        }
      }
    }

    pedido.estado = nuevoEstado;

    await manager.save(Pedido, pedido);
  });

  const pedidoActualizado = await this.pedidosRepository.findOne({
    where: { id },
    relations: {
      usuario: true,
      detalles: true,
    },
  });

  if (!pedidoActualizado) {
    throw new NotFoundException(
      `Pedido con ID ${id} no encontrado`,
    );
  }

  return pedidoActualizado;
}

private validarCambioEstado(
  estadoActual: EstadoPedido,
  nuevoEstado: EstadoPedido,
): void {
  const cambiosPermitidos: Record<
    EstadoPedido,
    EstadoPedido[]
  > = {
    [EstadoPedido.PENDIENTE]: [
      EstadoPedido.PROCESANDO,
      EstadoPedido.CANCELADO,
    ],
    [EstadoPedido.PROCESANDO]: [
      EstadoPedido.ENVIADO,
      EstadoPedido.CANCELADO,
    ],
    [EstadoPedido.ENVIADO]: [
      EstadoPedido.ENTREGADO,
    ],
    [EstadoPedido.ENTREGADO]: [],
    [EstadoPedido.CANCELADO]: [],
  };

  const permitidos = cambiosPermitidos[estadoActual];

  if (!permitidos.includes(nuevoEstado)) {
    throw new BadRequestException(
      `No se puede cambiar un pedido de ${estadoActual} a ${nuevoEstado}`,
    );
  }
}
  

}