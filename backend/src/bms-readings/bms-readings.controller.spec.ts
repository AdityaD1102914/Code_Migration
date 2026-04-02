import { Test, TestingModule } from '@nestjs/testing';
import { BmsReadingsController } from './bms-readings.controller';

describe('BmsReadingsController', () => {
  let controller: BmsReadingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BmsReadingsController],
    }).compile();

    controller = module.get<BmsReadingsController>(BmsReadingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
