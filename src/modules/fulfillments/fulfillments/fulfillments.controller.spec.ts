import { Test, TestingModule } from '@nestjs/testing';
import { FulfillmentsController } from './fulfillments.controller';

describe('FulfillmentsController', () => {
  let controller: FulfillmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FulfillmentsController],
    }).compile();

    controller = module.get<FulfillmentsController>(FulfillmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
