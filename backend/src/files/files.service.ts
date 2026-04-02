import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { File } from './schemas/file.schema';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileQueryDto } from './dto/file-query.dto';

@Injectable()
export class FilesService {
  constructor(@InjectModel(File.name) private fileModel: Model<File>) {}

  async uploadFile(createFileDto: CreateFileDto): Promise<File> {
    const file = new this.fileModel(createFileDto);
    return file.save();
  }

  async uploadMultipleFiles(filesData: CreateFileDto[]): Promise<any[]> {
    const docs = await this.fileModel.insertMany(filesData);
    return docs.map(doc => doc.toJSON());
  }

  async findAll(query: FileQueryDto, userId: string, userRole: string) {
    const {
      page = 1,
      limit = 10,
      search,
      mimetype,
      tags,
      isPublic,
      uploadedBy,
    } = query;

    // Build query conditions
    const conditions: any = {};

    // If not ADMIN, only show public files or user's own files
    if (userRole !== 'ADMIN') {
      conditions.$or = [
        { isPublic: true },
        { uploadedBy: userId },
      ];
    }

    // Apply additional filters
    if (search) {
      conditions.$text = { $search: search };
    }

    if (mimetype) {
      conditions.mimetype = { $regex: mimetype, $options: 'i' };
    }

    if (tags && tags.length > 0) {
      conditions.tags = { $in: tags };
    }

    if (isPublic !== undefined) {
      conditions.isPublic = isPublic;
    }

    if (uploadedBy && userRole === 'ADMIN') {
      conditions.uploadedBy = uploadedBy;
    }

    const files = await this.fileModel
      .find(conditions)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await this.fileModel.countDocuments(conditions);

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const filesWithDownloadUrl = files.map(file => ({
      ...file.toJSON(),
      downloadUrl: `${baseUrl}/api/v1/files/download/${file.filename}`,
    }));

    return {
      files: filesWithDownloadUrl,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string, userRoles: string[]): Promise<File> {
    const file = await this.fileModel.findById(id).populate('uploadedBy', 'name email');
    
    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Check access permissions
    // if (!userRoles.includes('ADMIN') && !file.isPublic && file.uploadedBy._id.toString() !== userId) {
    //   throw new ForbiddenException('Access denied');
    // }

    return file;
  }

  async findByFilename(filename: string, userId: string, userRoles: string[]): Promise<File> {
    const file = await this.fileModel.findOne({ filename }).populate('uploadedBy', 'name email');
    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Check access permissions
    // if (!userRoles.includes('ADMIN') && !file.isPublic && file.uploadedBy._id.toString() !== userId) {
    //   throw new ForbiddenException('Access denied');
    // }

    return file;
  }

  async update(id: string, updateFileDto: UpdateFileDto, userId: string, userRoles: string[]): Promise<File> {
    const file = await this.fileModel.findById(id);
    
    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Check permissions - only owner or ADMIN can update
    // if (!userRoles.includes('ADMIN') && file.uploadedBy.toString() !== userId) {
    //   throw new ForbiddenException('Access denied');
    // }

    Object.assign(file, updateFileDto);
    return file.save();
  }

  async remove(id: string, userId: string, userRoles: string[]): Promise<void> {
    const file = await this.fileModel.findById(id);
    
    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Check permissions - only owner or ADMIN can delete
    if (!userRoles.includes('ADMIN') && file.uploadedBy.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Delete physical file
    const filePath = path.join(process.cwd(), file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await this.fileModel.findByIdAndDelete(id);
  }

  async getUserFiles(userId: string, page: number = 1, limit: number = 10) {
    const files = await this.fileModel
      .find({ uploadedBy: userId })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await this.fileModel.countDocuments({ uploadedBy: userId });

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const filesWithDownloadUrl = files.map(file => ({
      ...file.toJSON(),
      downloadUrl: `${baseUrl}/api/v1/files/download/${file.filename}`,
    }));

    return {
      files: filesWithDownloadUrl,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getFileStats(userId?: string) {
    const query = userId ? { uploadedBy: userId } : {};
    
    const files = await this.fileModel.find(query);
    
    const stats = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      filesByType: {} as { [key: string]: number },
      publicFiles: files.filter(file => file.isPublic).length,
      privateFiles: files.filter(file => !file.isPublic).length,
    };

    // Group by file category
    files.forEach(file => {
      const category = this.getFileCategory(file.mimetype);
      stats.filesByType[category] = (stats.filesByType[category] || 0) + 1;
    });

    return stats;
  }

  private getFileCategory(mimetype: string): string {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype.includes('pdf') || mimetype.includes('document') || mimetype.includes('text')) return 'document';
    return 'other';
  }
}