import { IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class SubscribeTopicDto {
  @IsNotEmpty()
  topic: string | string[];

  @IsOptional()
  @IsObject()
  options?: {
    qos?: 0 | 1 | 2;
  };
}