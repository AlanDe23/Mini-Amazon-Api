import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MetodoPago } from '../enums/metodo-pago.enum';

export class CreatePedidoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(300)
  direccionEnvio!: string;

  @IsEnum(MetodoPago)
  metodoPago!: MetodoPago;
}
