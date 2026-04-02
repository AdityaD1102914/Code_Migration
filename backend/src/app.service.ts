import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
@Injectable()
export class AppService {

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) { }
  async getHello(): Promise<string> {
    console.log('App service is called')
    return 'Hello World!';
  }
}
