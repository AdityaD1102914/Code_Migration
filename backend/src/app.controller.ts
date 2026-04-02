import { Controller, Get, Inject, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { Cache, CACHE_MANAGER, CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

// @UseInterceptors(CacheInterceptor)
@Controller()
export class AppController {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache, private readonly appService: AppService) { }

  @Get()
  //decorators will work as we do in manual
  // @CacheKey('app-cache')
  // @CacheTTL(10000)
  async getHello(): Promise<string> {
    return await this.appService.getHello();;
  }
}
