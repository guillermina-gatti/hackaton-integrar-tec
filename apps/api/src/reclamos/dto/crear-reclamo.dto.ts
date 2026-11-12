import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, Length } from 'class-validator';

export const TIPOS_RECLAMO = ['susto', 'sombra robada', 'frio', 'ruido'] as const;

export class CrearReclamoDto {
  @ApiPropertyOptional({ example: 'Juan Pérez', description: 'Required unless the claim is anonymous' })
  @IsOptional()
  @IsString()
  @Length(1, 60)
  nombre?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  anonimo?: boolean;

  @ApiProperty({ enum: TIPOS_RECLAMO, example: 'sombra robada' })
  @IsIn(TIPOS_RECLAMO)
  tipo!: (typeof TIPOS_RECLAMO)[number];

  @ApiPropertyOptional({ example: 'El Vecino del 3B', description: 'Person the claim is filed against' })
  @IsOptional()
  @IsString()
  @Length(1, 60)
  reclamadoA?: string;

  @ApiProperty({ example: 'Mi sombra se fue al cine sin avisar' })
  @IsString()
  @Length(1, 200)
  descripcion!: string;
}
