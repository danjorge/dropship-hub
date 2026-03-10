import { Test, TestingModule } from '@nestjs/testing';
import { FulfillmentsService } from './fulfillments.service';

describe('FulfillmentsService', () => {
  let service: FulfillmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FulfillmentsService],
    }).compile();

    service = module.get<FulfillmentsService>(FulfillmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
