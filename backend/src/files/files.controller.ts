import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Query,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileQueryDto } from './dto/file-query.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ConfigService } from '@nestjs/config';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {

  constructor(private readonly filesService: FilesService, private readonly configService : ConfigService) { }

  @Post('upload/single')
  // @Roles(this.configService.get<string[]>('FILE_MANAGER_ROLES') ?? ['ADMIN'])
  // @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const fileData: CreateFileDto = {
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      uploadedBy: user._id || '',
      isPublic: body.isPublic === 'true',
      tags: body.tags ? body.tags.split(',').map((tag: string) => tag.trim()) : [],
      description: body.description,
    };

    const uploadedFile = await this.filesService.uploadFile(fileData);
    return {
      success: true,
      message: 'File uploaded successfully',
      data: uploadedFile,
    };
  }

  @Post('upload/multiple')
  @UseInterceptors(FilesInterceptor('files', 5))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
    @CurrentUser() user: any,
  ) {
    if (!files || files.length === 0) {
      throw new Error('No files uploaded');
    }

    const filesData: CreateFileDto[] = files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      uploadedBy: user._id,
      isPublic: body.isPublic === 'true',
      tags: body.tags ? body.tags.split(',').map((tag: string) => tag.trim()) : [],
      description: body.description,
    }));

    const uploadedFiles = await this.filesService.uploadMultipleFiles(filesData);
    return {
      success: true,
      message: 'Files uploaded successfully',
      data: uploadedFiles,
    };
  }

  @Get('all')
  async findAll(@Query() query: FileQueryDto, @CurrentUser() user: any) {
    const result = await this.filesService.findAll(query, user._id, user.roles);
    return {
      success: true,
      message: 'Files retrieved successfully',
      data: result,
    };
  }

  @Get()
  async getUserFiles(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @CurrentUser() user: any,
  ) {
    const result = await this.filesService.getUserFiles(
      user._id,
      parseInt(page),
      parseInt(limit),
    );
    return {
      success: true,
      message: 'User files retrieved successfully',
      data: result,
    };
  }

  @Get('stats')
  async getFileStats(@CurrentUser() user: any) {
    // Admin can get global stats, users get their own stats
    const userId = user.roles.includes('ADMIN') ? undefined : user._id;
    const stats = await this.filesService.getFileStats(userId);

    return {
      success: true,
      message: 'File statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('download/:filename')
  async downloadFile(
    @Param('filename') filename: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const file = await this.filesService.findByFilename(filename, user._id, user.roles);
    const filePath = path.join(process.cwd(), file.path);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found on disk');
    }

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Length', file.size.toString());
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    fileStream.on('error', (err) => {
      res.status(500).end('Error streaming file');
      fileStream.destroy();//release file handle
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const file = await this.filesService.findOne(id, user._id, user.roles);
    return {
      success: true,
      message: 'File retrieved successfully',
      data: file,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto,
    @CurrentUser() user: any,
  ) {
    const file = await this.filesService.update(id, updateFileDto, user._id, user.roles);
    return {
      success: true,
      message: 'File updated successfully',
      data: file,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.filesService.remove(id, user._id, user.roles);
    return {
      success: true,
      message: 'File deleted successfully',
    };
  }
}