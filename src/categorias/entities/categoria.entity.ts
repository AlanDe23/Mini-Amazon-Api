import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';

@Entity({ name: 'categorias' })
export class Categoria {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100, unique: true })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ default: true })
  activo!: boolean;

  @CreateDateColumn()
  fechaCreacion!: Date;

  @OneToMany(() => Producto, (producto) => producto.categoria)
  productos!: Producto[];
}

