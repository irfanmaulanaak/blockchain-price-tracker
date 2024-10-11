import { Controller, Get, Post, Body, Param, Query, BadRequestException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PriceService } from './price.service';
import { EmailService } from '../email/email.service';
import { CreatePriceAlertDto } from './dto/create-price-alert.dto';

@ApiTags('price')
@Controller('price')
export class PriceController {
  constructor(
    private readonly priceService: PriceService,
    private readonly emailService: EmailService,
  ) {}

  @Get(':chain/history')
  @ApiOperation({ summary: 'Get hourly price history for the last 24 hours' })
  @ApiParam({ name: 'chain', enum: ['ethereum', 'polygon'] })
  @ApiResponse({ status: 200, description: 'Returns the hourly price history or a message if no data is found' })
  async getPriceHistory(@Param('chain') chain: string) {
    const result = await this.priceService.getPriceHistory(chain);
    if (typeof result === 'string') {
      return { message: result };
    }
    return result;
  }

  @Post('alert')
  @ApiOperation({ summary: 'Set price alert' })
  @ApiResponse({ status: 201, description: 'Price alert set successfully' })
  @ApiBody({ type: CreatePriceAlertDto })
  async setPriceAlert(@Body() alertData: CreatePriceAlertDto) {
    const alert = await this.priceService.createPriceAlert(
      alertData.chain,
      alertData.price,
      alertData.email,
    );
    return { message: 'Price alert set successfully', alert };
  }

  @Get('swap')
  @ApiOperation({ summary: 'Get swap rate (ETH to BTC)' })
  @ApiQuery({
    name: 'amount',
    type: 'number',
    description: 'Amount of ETH to swap',
  })
  @ApiResponse({ status: 200, description: 'Returns the swap rate and fee' })
  async getSwapRate(@Query('amount') amount: number) {
    if (isNaN(amount) || amount <= 0) {
      throw new BadRequestException('Invalid amount. Please provide a positive number.');
    }
    return this.priceService.getSwapRate(amount);
  }
}
