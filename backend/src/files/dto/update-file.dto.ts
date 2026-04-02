import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  MaxLength,
} from 'class-validator';

export class UpdateFileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  originalName?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}