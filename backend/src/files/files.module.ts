import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { File, FileSchema } from './schemas/file.schema';
import { multerConfig } from './config/multer.config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: multerConfig,
      inject: [ConfigService],
    }),
  ],
  providers: [FilesService],
  controllers: [FilesController],
})
export class FilesModule {}