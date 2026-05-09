import { Module } from '@nestjs/common';
import { ContentRenderingService } from './content-rendering.service';

@Module({
  providers: [ContentRenderingService],
  exports: [ContentRenderingService],
})
export class ContentRenderingModule {}
