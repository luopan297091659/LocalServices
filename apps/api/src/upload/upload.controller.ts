import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4']);

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({ destination: (_request, _file, callback) => callback(null, process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads')), filename: (_request, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`) }),
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => callback(null, allowedMimeTypes.has(file.mimetype)),
  }))
  upload(@UploadedFile() file?: Express.Multer.File): { url: string; mimeType: string; size: number } {
    if (!file) throw new BadRequestException('JPEG、PNG、WEBP、MP4ファイルを選択してください');
    if (file.mimetype.startsWith('image/') && file.size > 10 * 1024 * 1024) throw new BadRequestException('画像は10MB以下にしてください');
    return { url: `/uploads/${file.filename}`, mimeType: file.mimetype, size: file.size };
  }
}
