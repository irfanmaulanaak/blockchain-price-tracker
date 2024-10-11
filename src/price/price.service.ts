import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Between } from 'typeorm';
import { Price } from './price.entity';
import { PriceAlert } from './price-alert.entity';
import { MoralisService } from './moralis.service';
@Injectable()
export class PriceService {
  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    @InjectRepository(PriceAlert)
    private priceAlertRepository: Repository<PriceAlert>,
    private moralisService: MoralisService,
  ) {}

  async savePrices(chain: string, price: number): Promise<Price> {
    try {
        const newPrice = this.priceRepository.create({ chain, price });
        return this.priceRepository.save(newPrice);
    } catch (error) {
        console.error(error);
        throw error;
    }
  }

  async getPriceAtTime(chain: string, time: Date): Promise<Price | null> {
    return this.priceRepository.findOne({
      where: {
        chain,
        timestamp: LessThanOrEqual(time),
      },
      order: {
        timestamp: 'DESC',
      },
    });
  }

  async getPriceHistory(
    chain: string,
  ): Promise<{ timestamp: Date; price: number }[] | string> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
  
    const prices = await this.priceRepository.find({
      where: {
        chain,
        timestamp: Between(startDate, endDate),
      },
      order: {
        timestamp: 'ASC',
      },
    });
  
    if (prices.length === 0) {
      return "No data found, please wait for data to be collected";
    }
  
    const hourlyPrices = [];
    for (let i = 0; i < 24; i++) {
      const hourDate = new Date(startDate.getTime() + i * 60 * 60 * 1000);
      const closestPrice = prices.reduce((prev, curr) =>
        Math.abs(curr.timestamp.getTime() - hourDate.getTime()) <
        Math.abs(prev.timestamp.getTime() - hourDate.getTime())
          ? curr
          : prev,
      );
      hourlyPrices.push({
        timestamp: hourDate,
        price: closestPrice.price,
      });
    }
  
    return hourlyPrices;
  }

  async checkPriceIncrease(chain: string): Promise<boolean> {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const [currentPrice, oldPrice] = await Promise.all([
      this.priceRepository.findOne({
        where: { chain },
        order: { timestamp: 'DESC' },
      }),
      this.priceRepository.findOne({
        where: {
          chain,
          timestamp: LessThanOrEqual(oneHourAgo),
        },
        order: { timestamp: 'DESC' },
      }),
    ]);

    if (!currentPrice || !oldPrice) {
      return false;
    }

    const increasePercentage =
      ((currentPrice.price - oldPrice.price) / oldPrice.price) * 100;
    return increasePercentage > 3;
  }

  async createPriceAlert(
    chain: string,
    targetPrice: number,
    email: string,
  ): Promise<PriceAlert> {
    try {
        const alert = this.priceAlertRepository.create({
            chain,
            targetPrice,
            email,
          });
          return this.priceAlertRepository.save(alert);
    } catch (error) {
        console.error('price.service.ts:createPriceAlert error:',error);
        throw error;
    }

  }

  async checkAndTriggerAlerts(
    chain: string,
    currentPrice: number,
  ): Promise<PriceAlert[]> {
    try {
        const alerts = await this.priceAlertRepository.find({
            where: {
              chain,
              triggered: false,
              targetPrice: LessThanOrEqual(currentPrice),
            },
          });
      
          for (const alert of alerts) {
            alert.triggered = true;
            await this.priceAlertRepository.save(alert);
          }
      
          return alerts;
    } catch (error) {
        console.error('price.service.ts:checkAndTriggerAlerts error: ', error);
    }
  }

  async getSwapRate(ethAmount: number): Promise<{ btcAmount: number; feeEth: number; feeUsd: number }> {
    try {
        const evmApi = this.moralisService.getEvmApi();
    
        const [ethPrice, btcPrice] = await Promise.all([
          evmApi.token.getTokenPrice({
            address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          }),
          evmApi.token.getTokenPrice({
            address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
          }),
        ]);
        
        const ethUsdPrice = ethPrice.result.usdPrice;
        const btcUsdPrice = btcPrice.result.usdPrice;
        
        const btcAmount = (ethAmount * ethUsdPrice) / btcUsdPrice;
        const feeEth = ethAmount * 0.0003;
        const feeUsd = feeEth * ethUsdPrice;
        
        return {
          btcAmount: Number(btcAmount.toFixed(8)),
          feeEth: Number(feeEth.toFixed(8)),
          feeUsd: Number(feeUsd.toFixed(2)),
        };
    } catch (error) {
        console.error('price.service.ts:getSwapRate error: ', error);
        throw error;
    }

  }
  
}
