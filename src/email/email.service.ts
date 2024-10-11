import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendPriceAlert(to: string, chain: string, price: number) {
    await this.mailerService.sendMail({
      to: to,
      subject: `Price Alert for ${chain}`,
      text: `The price of ${chain} has reached $${price}`,
    });
  }

  async sendPriceIncrease(chain: string, oldPrice: number, newPrice: number) {
    await this.mailerService.sendMail({
      to: 'hyperhire_assignment@hyperhire.in',
      subject: `Significant Price Increase for ${chain}`,
      text: `The price of ${chain} has increased by more than 3% in the last hour. Old price: $${oldPrice}, New price: $${newPrice}`,
    });
  }
}