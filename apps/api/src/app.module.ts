import { Module } from '@nestjs/common';
import { ReclamosModule } from './reclamos/reclamos.module';

@Module({
  imports: [ReclamosModule],
})
export class AppModule {}
