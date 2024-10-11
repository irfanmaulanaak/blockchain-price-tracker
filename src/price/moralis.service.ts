import { Injectable, OnModuleInit } from '@nestjs/common';
import Moralis from 'moralis';
import { EvmApi } from '@moralisweb3/evm-api';

@Injectable()
export class MoralisService implements OnModuleInit {
  async onModuleInit() {
    await Moralis.start({
      apiKey: process.env.MORALIS_API_KEY,
    });
  }

  getEvmApi(): EvmApi {
    return Moralis.EvmApi;
  }
}