import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class PublishMessageDto {
  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsNotEmpty()
  message: string | object;

  @IsOptional()
  @IsObject()
  options?: {
    qos?: 0 | 1 | 2;
    retain?: boolean;
    dup?: boolean;
  };
}