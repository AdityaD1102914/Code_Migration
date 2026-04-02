import { Test, TestingModule } from '@nestjs/testing';
import { GithubauthService } from './githubauth.service';

describe('GithubauthService', () => {
  let service: GithubauthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GithubauthService],
    }).compile();

    service = module.get<GithubauthService>(GithubauthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
