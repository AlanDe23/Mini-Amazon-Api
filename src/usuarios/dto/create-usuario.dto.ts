import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre!: string;

  @IsEmail()
  @MaxLength(150)
  correo!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;
}
