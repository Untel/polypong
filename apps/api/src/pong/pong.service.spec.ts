import { Test, TestingModule } from '@nestjs/testing';
import { PongService } from './pong.service';

describe('PongService', () => {
  let service: PongService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PongService],
    }).compile();

    service = module.get<PongService>(PongService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
