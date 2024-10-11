import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { Price } from './price.entity';
import { PriceAlert } from './price-alert.entity';
import { PriceScheduler } from './price.scheduler';
import { EmailService } from '../email/email.service';
import { MoralisService } from './moralis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Price, PriceAlert])],
  providers: [PriceService, PriceScheduler, EmailService, MoralisService],
  controllers: [PriceController],
  exports: [PriceService],
})
export class PriceModule {}
