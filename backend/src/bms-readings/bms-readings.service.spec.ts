import { Test, TestingModule } from '@nestjs/testing';
import { BmsReadingsService } from './bms-readings.service';

describe('BmsReadingsService', () => {
  let service: BmsReadingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BmsReadingsService],
    }).compile();

    service = module.get<BmsReadingsService>(BmsReadingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
