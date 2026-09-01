import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity({ name: 'carrito_items' })
@Unique(['usuarioId', 'productoId'])
export class Carrito {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  usuarioId!: number;

  @Column()
  productoId!: number;

  @Column({ type: 'int', default: 1 })
  cantidad!: number;

  @CreateDateColumn()
  fechaAgregado!: Date;

  @ManyToOne(() => Usuario, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuarioId' })
  usuario!: Usuario;

  @ManyToOne(() => Producto, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productoId' })
  producto!: Producto;
}