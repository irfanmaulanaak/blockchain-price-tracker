import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PriceService } from './price.service';
import { EmailService } from 'src/email/email.service';
import { MoralisService } from './moralis.service';

@Injectable()
export class PriceScheduler {
  constructor(
    private readonly priceService: PriceService,
    private readonly emailService: EmailService,
    private readonly moralisService: MoralisService
  ) {}

  @Cron('*/5 * * * *')
  async fetchAndSavePrices() {
    try {
      const evmApi = this.moralisService.getEvmApi();
      //this is weth address
      const ethPrice = await evmApi.token.getTokenPrice({
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      });

      //this is matic address
      const maticPrice = await evmApi.token.getTokenPrice({
        address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
      });

      await this.priceService.savePrices('ethereum', ethPrice.result.usdPrice);
      await this.priceService.savePrices('polygon', maticPrice.result.usdPrice);

      console.log('Prices fetched and saved');

      //trigger alerts if needed
      const triggeredEthAlerts = await this.priceService.checkAndTriggerAlerts(
        'ethereum',
        ethPrice.result.usdPrice,
      );
      const triggeredMaticAlerts =
        await this.priceService.checkAndTriggerAlerts(
          'polygon',
          maticPrice.result.usdPrice,
        );

      for (const alert of [...triggeredEthAlerts, ...triggeredMaticAlerts]) {
        await this.emailService.sendPriceAlert(
          alert.email,
          alert.chain,
          alert.targetPrice,
        );
      }

      await this.checkPriceIncreases('ethereum', ethPrice.result.usdPrice);
      await this.checkPriceIncreases('polygon', maticPrice.result.usdPrice);
    } catch (error) {
      console.error(
        'price.scheduler.ts:fetchAndSavePrices CRON error: ' + error,
      );
    }
    console.log('Cron job finished at:', new Date().toISOString());
  }

  private async checkPriceIncreases(chain: string, currentPrice: number) {
    const hasSignificantIncrease =
      await this.priceService.checkPriceIncrease(chain);
    if (hasSignificantIncrease) {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      const oldPrice = await this.priceService.getPriceAtTime(
        chain,
        oneHourAgo,
      );
      if (oldPrice) {
        await this.emailService.sendPriceIncrease(
          chain,
          oldPrice.price,
          currentPrice,
        );
      }
    }
  }
}
