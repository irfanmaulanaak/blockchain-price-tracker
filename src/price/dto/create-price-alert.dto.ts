import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEmail } from 'class-validator';

export class CreatePriceAlertDto {
  @ApiProperty({
    description: 'The blockchain (ethereum or polygon)',
    example: 'ethereum',
  })
  @IsString()
  chain: string;

  @ApiProperty({
    description: 'The target price for the alert',
    example: 1000,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'The email address to send the alert to',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}