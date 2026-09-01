import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';
import { Pedido } from './pedido.entity';

@Entity({ name: 'detalles_pedido' })
export class DetallePedido {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  pedidoId!: number;

  @ManyToOne(() => Pedido, (pedido) => pedido.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pedidoId' })
  pedido!: Pedido;

  @Column({ type: 'int', nullable: true })
  productoId!: number | null;

  @ManyToOne(() => Producto, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'productoId' })
  producto!: Producto | null;

  @Column({ length: 150 })
  productoNombre!: string;

  @Column({ type: 'int' })
  cantidad!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  precioUnitario!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  subtotal!: number;
}