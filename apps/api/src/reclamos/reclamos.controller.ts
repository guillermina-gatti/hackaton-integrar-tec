import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CrearReclamoDto } from './dto/crear-reclamo.dto';
import { ReclamosService } from './reclamos.service';

@ApiTags('claims')
@Controller('reclamos')
export class ReclamosController {
  constructor(private readonly reclamosService: ReclamosService) {}

  // POST /api/reclamos
  @Post()
  crear(@Body() dto: CrearReclamoDto) {
    return this.reclamosService.registrar(dto);
  }

  // GET /api/reclamos: all submitted claims, newest first
  @Get()
  listar() {
    return this.reclamosService.listar();
  }

  // POST /api/reclamos/aleatorios?cantidad=8
  @Post('aleatorios')
  @ApiQuery({ name: 'cantidad', required: false, example: 8 })
  generarAleatorios(@Query('cantidad') cantidad?: string) {
    const n = Math.min(Math.max(Number(cantidad) || 8, 1), 30);
    return this.reclamosService.generarAleatorios(n);
  }
}
