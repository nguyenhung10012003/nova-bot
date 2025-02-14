import { IsString } from 'class-validator';

export class CreateChatflowDto {
  @IsString()
  name: string;
  @IsString()
  chatflowId: string;
  @IsString()
  baseUrl?: string;
  @IsString()
  apiKey?: string;
}
