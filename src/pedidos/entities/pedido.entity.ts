import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { EstadoPedido } from '../enums/estado-pedido.enum';
import { MetodoPago } from '../enums/metodo-pago.enum';
import { DetallePedido } from './detalle-pedido.entity';
import { Categoria } from '../../categorias/entities/categoria.entity';

@Entity({ name: 'pedidos' })
export class Pedido {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  usuarioId!: number;

  @ManyToOne(() => Usuario, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'usuarioId' })
  usuario!: Usuario;

  @Column({ type: 'text' })
  direccionEnvio!: string;

  @Column({
    type: 'enum',
    enum: MetodoPago,
  })
  metodoPago!: MetodoPago;

  @Column({
    type: 'enum',
    enum: EstadoPedido,
    default: EstadoPedido.PENDIENTE,
  })
  estado!: EstadoPedido;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  total!: number;

  @CreateDateColumn()
  fechaCreacion!: Date;

  @OneToMany(
    () => DetallePedido,
    (detalle) => detalle.pedido,
    { cascade: true },
  )
  detalles!: DetallePedido[];
@Column({ type: 'int', nullable: true })
categoriaId!: number | null;

@ManyToOne(
  () => Categoria,
  (categoria) => categoria.productos,
  {
    nullable: true,
  },
)
@JoinColumn({ name: 'categoriaId' })
categoria!: Categoria | null;

  
}
