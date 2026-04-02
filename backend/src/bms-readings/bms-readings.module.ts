import { Module } from '@nestjs/common';
import { BmsReadingsController } from './bms-readings.controller';
import { BmsReadingsService } from './bms-readings.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Reading, ReadingSchema } from './schema/readings.schema';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule,
    MongooseModule.forFeature([
    {
      name: Reading.name,
      schema: ReadingSchema,
      collection: 'devicereadings'
    }
  ])],
  controllers: [BmsReadingsController],
  providers: [BmsReadingsService],
  exports: [BmsReadingsService]
})
export class BmsReadingsModule { }
