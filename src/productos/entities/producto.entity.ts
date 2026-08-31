import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Categoria } from '../../categorias/entities/categoria.entity';

@Entity({ name: 'productos' })
export class Producto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  nombre!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  precio!: number;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ nullable: true })
  imagenUrl?: string;

  @Column({ default: true })
  activo!: boolean;

  @CreateDateColumn()
  fechaCreacion!: Date;

  @Column({ type: 'int', nullable: true })
  categoriaId!: number | null;

  @ManyToOne(() => Categoria, (categoria) => categoria.productos, {
    nullable: true,
  })
  @JoinColumn({ name: 'categoriaId' })
  categoria!: Categoria | null;
}