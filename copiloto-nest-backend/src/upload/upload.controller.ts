import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload-image')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string,
    @Body('oldImageUrl') oldImageUrl?: string,
  ) {
    const url = await this.uploadService.uploadImage(file, type, oldImageUrl);
    return { url, success: true };
  }
}
