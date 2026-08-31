import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';

type UsuarioSinPassword = Omit<Usuario, 'password'>;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async create(
    createUsuarioDto: CreateUsuarioDto,
  ): Promise<UsuarioSinPassword> {
    const correo = createUsuarioDto.correo.trim().toLowerCase();

    const usuarioExistente = await this.usuariosRepository.findOneBy({
      correo,
    });

    if (usuarioExistente) {
      throw new ConflictException('Este correo ya está registrado');
    }

    const passwordCifrado = await bcrypt.hash(
      createUsuarioDto.password,
      12,
    );

    const usuario = this.usuariosRepository.create({
      nombre: createUsuarioDto.nombre.trim(),
      correo,
      password: passwordCifrado,
    });

    const usuarioGuardado = await this.usuariosRepository.save(usuario);

    return this.eliminarPassword(usuarioGuardado);
  }

  async findAll(): Promise<Usuario[]> {
    return await this.usuariosRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOneBy({ id });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return usuario;
  }

  async findByCorreoConPassword(
    correo: string,
  ): Promise<Usuario | null> {
    return await this.usuariosRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.password')
      .where('LOWER(usuario.correo) = LOWER(:correo)', {
        correo: correo.trim(),
      })
      .getOne();
  }

  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<UsuarioSinPassword> {
    const usuario = await this.findOne(id);

    if (updateUsuarioDto.correo) {
      const nuevoCorreo = updateUsuarioDto.correo.trim().toLowerCase();

      const usuarioConCorreo = await this.usuariosRepository.findOneBy({
        correo: nuevoCorreo,
      });

      if (usuarioConCorreo && usuarioConCorreo.id !== id) {
        throw new ConflictException('Este correo ya está registrado');
      }

      usuario.correo = nuevoCorreo;
    }

    if (updateUsuarioDto.nombre) {
      usuario.nombre = updateUsuarioDto.nombre.trim();
    }

    if (updateUsuarioDto.password) {
      usuario.password = await bcrypt.hash(
        updateUsuarioDto.password,
        12,
      );
    }

    const usuarioActualizado =
      await this.usuariosRepository.save(usuario);

    return this.eliminarPassword(usuarioActualizado);
  }

  async remove(id: number): Promise<UsuarioSinPassword> {
    const usuario = await this.findOne(id);
    const usuarioEliminado =
      await this.usuariosRepository.remove(usuario);

    return this.eliminarPassword(usuarioEliminado);
  }

  private eliminarPassword(
    usuario: Usuario,
  ): UsuarioSinPassword {
    const { password, ...usuarioSeguro } = usuario;

    return usuarioSeguro;
  }
}